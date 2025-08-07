import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, MessageSquare } from 'lucide-react';

interface ParticipantRolesProps {
  analysis: {
    participants: string[];
    messageStats: Record<string, number>;
    insights: {
      roles: Record<string, string>;
      dynamics: string[];
    };
  };
}

export function ParticipantRoles({ analysis }: ParticipantRolesProps) {
  const { participants, messageStats, insights } = analysis;
  
  // Sort participants by message count
  const sortedParticipants = participants
    .sort((a, b) => messageStats[b] - messageStats[a])
    .slice(0, 5); // Show top 5

  const totalMessages = Object.values(messageStats).reduce((sum, count) => sum + count, 0);

  const getDefaultRole = (participant: string, index: number) => {
    if (index === 0) return "Chat Champion 🏆";
    if (messageStats[participant] > totalMessages * 0.4) return "Double Texter 💬";
    if (messageStats[participant] < totalMessages * 0.1) return "Lurker 👻";
    return "Squad Member ✨";
  };

  return (
    <Card className="bg-white border border-indigo-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl flex items-center justify-center gap-2 text-gray-800">
          <Users className="h-5 w-5 text-indigo-600" />
          Squad Roles & Rankings
        </CardTitle>
        <p className="text-gray-700 text-sm">Who's who in your chat universe</p>
      </CardHeader>
      
      <CardContent>
        {/* Leaderboard */}
        <div className="space-y-3 mb-6">
          {sortedParticipants.map((participant, index) => {
            const messageCount = messageStats[participant];
            const percentage = Math.round((messageCount / totalMessages) * 100);
            const role = insights.roles[participant] || getDefaultRole(participant, index);
            
            return (
              <div key={participant} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                    <span className="font-semibold text-sm text-gray-800">{participant}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-800">{messageCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">{percentage}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-purple-500' :
                        index === 2 ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs font-medium text-indigo-600">{role}</div>
              </div>
            );
          })}
        </div>

        {/* Chat Dynamics */}
        {insights.dynamics.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
              <MessageSquare className="h-4 w-4" />
              Chat Dynamics
            </h4>
            <ul className="space-y-1 text-xs text-gray-700">
              {insights.dynamics.slice(0, 4).map((dynamic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{dynamic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fun Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
            <div className="text-lg font-bold text-green-700">{participants.length}</div>
            <div className="text-xs text-green-600">Participants</div>
          </div>
          <div className="p-2 bg-orange-50 rounded border border-orange-200 text-center">
            <div className="text-lg font-bold text-orange-700">
              {Math.round(totalMessages / participants.length)}
            </div>
            <div className="text-xs text-orange-600">Avg/Person</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
