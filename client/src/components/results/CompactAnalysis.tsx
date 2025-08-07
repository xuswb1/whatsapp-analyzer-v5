import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Clock, Brain, AlertTriangle, Star, Hash, Smile } from 'lucide-react';

interface CompactAnalysisProps {
  analysis: {
    totalMessages: number;
    participants: string[];
    messageStats: Record<string, number>;
    insights: {
      roles: Record<string, string>;
      topEmojis: Array<{ emoji: string; count: number }>;
      topWords: Array<{ word: string; count: number }>;
      analysis: {
        language: string;
        activityAnalysis: string;
        responseAnalysis: string;
        languageAnalysis: string;
        emojiAnalysis: string;
        timeAnalysis: string;
        dynamicsAnalysis: string;
        redFlags: string[];
        standoutMoments: string[];
      };
      isMultiFile?: boolean;
      fileCount?: number;
    };
  };
}

export function CompactAnalysis({ analysis }: CompactAnalysisProps) {
  const { insights } = analysis;
  const sortedParticipants = analysis.participants
    .sort((a, b) => analysis.messageStats[b] - analysis.messageStats[a])
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Quick Stats */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-gray-600">Total Messages</div>
              <div className="font-semibold text-gray-800">
                {analysis.totalMessages.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-600">Participants</div>
              <div className="font-semibold text-gray-800">
                {analysis.participants.length}
                {insights.isMultiFile && ` (${insights.fileCount} files)`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Participants */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Top Chatters & Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {sortedParticipants.map((participant, index) => {
              const messageCount = analysis.messageStats[participant];
              const percentage = Math.round((messageCount / analysis.totalMessages) * 100);
              const role = insights.roles[participant] || "Chat Member ✨";
              
              return (
                <div key={participant} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-yellow-500">👑</span>}
                      <span className="font-medium text-gray-800 text-sm">{participant}</span>
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">{role}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800 text-sm">{messageCount}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Communication Activity</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.activityAnalysis}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Response Patterns</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.responseAnalysis}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Language & Tone</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.languageAnalysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emoji & Words */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-800 flex items-center gap-2">
              <Smile className="h-4 w-4 text-yellow-600" />
              Top Emojis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insights.topEmojis.slice(0, 5).map((emoji, index) => (
                <div key={emoji.emoji} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji.emoji}</span>
                    <span className="text-xs text-gray-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{emoji.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-800 flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-600" />
              Top Words
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insights.topWords.slice(0, 5).map((word, index) => (
                <div key={word.word} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{word.word}</span>
                    <span className="text-xs text-gray-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{word.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timing & Dynamics */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" />
            Timing & Dynamics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Activity Patterns</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.timeAnalysis}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Group Dynamics</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.dynamicsAnalysis}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Expression Style</h4>
              <p className="text-gray-700 leading-relaxed">{insights.analysis.emojiAnalysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      {insights.analysis.redFlags && insights.analysis.redFlags.length > 0 && (
        <Card className="bg-red-50 border border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insights.analysis.redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{flag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standout Moments */}
      {insights.analysis.standoutMoments && insights.analysis.standoutMoments.length > 0 && (
        <Card className="bg-amber-50 border border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Notable Moments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {insights.analysis.standoutMoments.map((moment, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{moment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          Analysis Language: <strong>{insights.analysis.language}</strong>
        </p>
      </div>
    </div>
  );
}
