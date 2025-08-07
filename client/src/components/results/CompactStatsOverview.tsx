import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Calendar, Files } from 'lucide-react';

interface CompactStatsOverviewProps {
  analysis: {
    totalMessages: number;
    participants: string[];
    messageStats: Record<string, number>;
    timeStats: {
      monthlyActivity: Record<string, number>;
    };
    insights: {
      isMultiFile?: boolean;
      fileCount?: number;
    };
  };
}

export function CompactStatsOverview({ analysis }: CompactStatsOverviewProps) {
  const totalDays = Object.keys(analysis.timeStats.monthlyActivity).length * 30;
  const avgMessagesPerDay = Math.round(analysis.totalMessages / Math.max(totalDays, 1));
  
  const topMessenger = Object.entries(analysis.messageStats)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="text-center bg-white border border-purple-200">
        <CardHeader className="pb-2">
          <MessageCircle className="h-6 w-6 text-purple-600 mx-auto" />
          <CardTitle className="text-lg font-bold text-gray-800">
            {analysis.totalMessages.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600">Total Messages</p>
        </CardContent>
      </Card>

      <Card className="text-center bg-white border border-teal-200">
        <CardHeader className="pb-2">
          <Users className="h-6 w-6 text-teal-600 mx-auto" />
          <CardTitle className="text-lg font-bold text-gray-800">
            {analysis.participants.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600">Participants</p>
        </CardContent>
      </Card>

      <Card className="text-center bg-white border border-blue-200">
        <CardHeader className="pb-2">
          <Calendar className="h-6 w-6 text-blue-600 mx-auto" />
          <CardTitle className="text-lg font-bold text-gray-800">
            {avgMessagesPerDay}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-600">Messages/Day</p>
        </CardContent>
      </Card>

      {analysis.insights.isMultiFile ? (
        <Card className="text-center bg-white border border-orange-200">
          <CardHeader className="pb-2">
            <Files className="h-6 w-6 text-orange-600 mx-auto" />
            <CardTitle className="text-lg font-bold text-gray-800">
              {analysis.insights.fileCount || 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600">Chat Files</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center bg-white border border-pink-200">
          <CardHeader className="pb-2">
            <div className="text-lg font-bold text-gray-800 truncate px-1">
              {topMessenger?.[0] || 'Everyone'}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600">Top Chatter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
