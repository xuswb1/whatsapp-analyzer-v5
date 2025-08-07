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
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          Squad Roles & Rankings
        </CardTitle>
        <p className="text-gray-600">Who's who in your chat universe</p>
      </CardHeader>
      
      <CardContent>
        {/* Leaderboard */}
        <div className="space-y-4 mb-6">
          {sortedParticipants.map((participant, index) => {
            const messageCount = messageStats[participant];
            const percentage = Math.round((messageCount / totalMessages) * 100);
            const role = insights.roles[participant] || getDefaultRole(participant, index);
            
            return (
              <div key={participant} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                    <span className="font-semibold text-lg">{participant}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{messageCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{percentage}% of chat</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-purple-500' :
                        index === 2 ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-indigo-600">{role}</div>
              </div>
            );
          })}
        </div>

        {/* Chat Dynamics */}
        {insights.dynamics.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Dynamics
            </h4>
            <ul className="space-y-2 text-sm">
              {insights.dynamics.map((dynamic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{dynamic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fun Stats */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{participants.length}</div>
            <div className="text-sm text-green-600">Total Participants</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">
              {Math.round(totalMessages / participants.length)}
            </div>
            <div className="text-sm text-orange-600">Avg Messages/Person</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
