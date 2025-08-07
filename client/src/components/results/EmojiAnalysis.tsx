import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile } from 'lucide-react';

interface EmojiAnalysisProps {
  analysis: {
    insights: {
      topEmojis: Array<{ emoji: string; count: number }>;
    };
  };
}

export function EmojiAnalysis({ analysis }: EmojiAnalysisProps) {
  const { topEmojis } = analysis.insights;

  if (!topEmojis || topEmojis.length === 0) {
    return (
      <Card className="text-center p-8 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <Smile className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Emojis Found 😐</h3>
        <p className="text-gray-600">This chat is emoji-free zone! How unusual... 🤔</p>
      </Card>
    );
  }

  const topEmoji = topEmojis[0];
  const totalEmojis = topEmojis.reduce((sum, emoji) => sum + emoji.count, 0);

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Smile className="h-6 w-6 text-yellow-600" />
          Your Emoji Wrapped 
        </CardTitle>
        <p className="text-gray-600">You sent {totalEmojis.toLocaleString()} emojis this year!</p>
      </CardHeader>
      
      <CardContent>
        {/* Top Emoji Hero */}
        <div className="text-center mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">{topEmoji.emoji}</div>
          <h3 className="text-xl font-bold mb-2">Your Emoji MVP!</h3>
          <p className="text-lg text-gray-600">
            Used {topEmoji.count} times ({Math.round((topEmoji.count / totalEmojis) * 100)}% of all emojis)
          </p>
        </div>

        {/* Top 5 Emojis */}
        <div className="space-y-3">
          <h4 className="font-semibold text-center mb-4">Your Top 5 Emojis</h4>
          {topEmojis.slice(0, 5).map((emoji, index) => (
            <div key={emoji.emoji} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji.emoji}</span>
                <span className="font-medium">#{index + 1}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{emoji.count}</div>
                <div className="text-sm text-gray-500">
                  {Math.round((emoji.count / totalEmojis) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fun Facts */}
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold mb-2">🎉 Emoji Fun Facts:</h4>
          <ul className="text-sm space-y-1">
            <li>• You're officially emoji-fluent! 📱</li>
            <li>• {topEmoji.emoji} is clearly your favorite expression</li>
            <li>• You used {topEmojis.length} different emoji types</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
