import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Calendar, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  analysis: {
    totalMessages: number;
    participants: string[];
    messageStats: Record<string, number>;
    timeStats: {
      monthlyActivity: Record<string, number>;
    };
  };
}

export function StatsOverview({ analysis }: StatsOverviewProps) {
  const totalDays = Object.keys(analysis.timeStats.monthlyActivity).length * 30; // Rough estimate
  const avgMessagesPerDay = Math.round(analysis.totalMessages / Math.max(totalDays, 1));
  
  const topMessenger = Object.entries(analysis.messageStats)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="text-center border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-2">
          <MessageCircle className="h-8 w-8 text-purple-600 mx-auto" />
          <CardTitle className="text-2xl font-bold text-purple-700">
            {analysis.totalMessages.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-600 font-medium">Total Messages</p>
          <p className="text-xs text-purple-500 mt-1">That's a lot of typing! 📱</p>
        </CardContent>
      </Card>

      <Card className="text-center border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
        <CardHeader className="pb-2">
          <Users className="h-8 w-8 text-teal-600 mx-auto" />
          <CardTitle className="text-2xl font-bold text-teal-700">
            {analysis.participants.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-teal-600 font-medium">Participants</p>
          <p className="text-xs text-teal-500 mt-1">The squad is here! 👥</p>
        </CardContent>
      </Card>

      <Card className="text-center border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-2">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
          <CardTitle className="text-2xl font-bold text-blue-700">
            {avgMessagesPerDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-600 font-medium">Messages/Day</p>
          <p className="text-xs text-blue-500 mt-1">Daily chat energy! ⚡</p>
        </CardContent>
      </Card>

      <Card className="text-center border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
        <CardHeader className="pb-2">
          <TrendingUp className="h-8 w-8 text-pink-600 mx-auto" />
          <CardTitle className="text-lg font-bold text-pink-700">
            {topMessenger?.[0] || 'Everyone'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-pink-600 font-medium">Top Chatter</p>
          <p className="text-xs text-pink-500 mt-1">
            {topMessenger ? `${topMessenger[1]} messages` : 'Equal participation!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
