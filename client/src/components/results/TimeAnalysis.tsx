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
      <Card className="bg-white border border-blue-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
            <Clock className="h-4 w-4 text-blue-600" />
            Daily Activity Pattern
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10, fill: '#374151' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
                <Bar 
                  dataKey="messages" 
                  fill="#3B82F6"
                  radius={[1, 1, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="font-semibold text-blue-700 text-sm">🌟 Peak Activity</div>
              <div className="text-xs text-gray-700">
                {peakHour.hour} - {peakHour.messages} messages
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-yellow-50 rounded text-center border border-yellow-200">
                <div className="font-medium text-gray-800">Morning</div>
                <div className="text-xs text-gray-600">
                  {getActivityLevel(9)}
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center border border-orange-200">
                <div className="font-medium text-gray-800">Evening</div>
                <div className="text-xs text-gray-600">
                  {getActivityLevel(21)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Activity */}
      <Card className="bg-white border border-purple-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
            <Calendar className="h-4 w-4 text-purple-600" />
            Monthly Chat Trends
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#374151' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#9333EA" 
                  strokeWidth={2}
                  dot={{ fill: '#9333EA', strokeWidth: 1, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="font-semibold text-purple-700 text-sm">📅 Peak Month</div>
              <div className="text-xs text-gray-700">
                {peakMonth.month} - {peakMonth.messages} messages
              </div>
            </div>

            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="font-semibold mb-1 text-gray-800 text-sm">📊 Timeline:</div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Most active: <strong>{peakMonth.month}</strong></li>
                <li>• Active months: <strong>{monthlyData.length}</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
