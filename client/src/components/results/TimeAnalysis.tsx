import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface TimeAnalysisProps {
  analysis: {
    timeStats: {
      hourlyActivity: Record<string, number>;
      monthlyActivity: Record<string, number>;
    };
  };
}

export function TimeAnalysis({ analysis }: TimeAnalysisProps) {
  const { hourlyActivity, monthlyActivity } = analysis.timeStats;

  // Prepare hourly data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: hour.toString().padStart(2, '0') + ':00',
    messages: hourlyActivity[hour] || 0,
    period: hour < 6 ? 'Night Owl' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
  }));

  // Prepare monthly data
  const monthlyData = Object.entries(monthlyActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      messages: count
    }));

  // Find peak activity times
  const peakHour = hourlyData.reduce((max, curr) => 
    curr.messages > max.messages ? curr : max
  );

  const peakMonth = monthlyData.reduce((max, curr) => 
    curr.messages > max.messages ? curr : max
  );

  const getActivityLevel = (hour: number) => {
    const messages = hourlyActivity[hour] || 0;
    const maxMessages = Math.max(...Object.values(hourlyActivity));
    const ratio = messages / maxMessages;
    
    if (ratio > 0.8) return 'Very High 🔥';
    if (ratio > 0.6) return 'High 📈';
    if (ratio > 0.4) return 'Medium 📊';
    if (ratio > 0.2) return 'Low 📉';
    return 'Very Low 😴';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Hourly Activity */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Daily Activity Pattern
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar 
                  dataKey="messages" 
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-blue-700">🌟 Peak Activity</div>
              <div className="text-sm">
                {peakHour.hour} - {peakHour.messages} messages
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-yellow-50 rounded text-center">
                <div className="font-medium">Morning (6-12)</div>
                <div className="text-xs">
                  {getActivityLevel(9)}
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-medium">Evening (18-24)</div>
                <div className="text-xs">
                  {getActivityLevel(21)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Activity */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Monthly Chat Trends
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#9333EA" 
                  strokeWidth={3}
                  dot={{ fill: '#9333EA', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="font-semibold text-purple-700">📅 Peak Month</div>
              <div className="text-sm">
                {peakMonth.month} - {peakMonth.messages} messages
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
              <div className="font-semibold mb-2">📊 Chat Timeline:</div>
              <ul className="text-sm space-y-1">
                <li>• Most active month: <strong>{peakMonth.month}</strong></li>
                <li>• Total active months: <strong>{monthlyData.length}</strong></li>
                <li>• Your chat journey spans across the year! 🗓️</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
