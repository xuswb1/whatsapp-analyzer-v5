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
      <Card className="text-center p-6 bg-white border border-yellow-200">
        <Smile className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2 text-gray-800">No Emojis Found 😐</h3>
        <p className="text-gray-700">This chat is emoji-free zone! How unusual... 🤔</p>
      </Card>
    );
  }

  const topEmoji = topEmojis[0];
  const totalEmojis = topEmojis.reduce((sum, emoji) => sum + emoji.count, 0);

  return (
    <Card className="bg-white border border-yellow-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl flex items-center justify-center gap-2 text-gray-800">
          <Smile className="h-5 w-5 text-yellow-600" />
          Your Emoji Wrapped 
        </CardTitle>
        <p className="text-gray-700 text-sm">You sent {totalEmojis.toLocaleString()} emojis!</p>
      </CardHeader>
      
      <CardContent>
        {/* Top Emoji Hero */}
        <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">{topEmoji.emoji}</div>
          <h3 className="text-lg font-bold mb-1 text-gray-800">Your Emoji MVP!</h3>
          <p className="text-sm text-gray-700">
            Used {topEmoji.count} times ({Math.round((topEmoji.count / totalEmojis) * 100)}% of all emojis)
          </p>
        </div>

        {/* Top 5 Emojis */}
        <div className="space-y-2">
          <h4 className="font-semibold text-center mb-3 text-gray-800">Your Top 5 Emojis</h4>
          {topEmojis.slice(0, 5).map((emoji, index) => (
            <div key={emoji.emoji} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emoji.emoji}</span>
                <span className="font-medium text-gray-800">#{index + 1}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-gray-800">{emoji.count}</div>
                <div className="text-xs text-gray-600">
                  {Math.round((emoji.count / totalEmojis) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fun Facts */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">🎉 Emoji Fun Facts:</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• You're officially emoji-fluent! 📱</li>
            <li>• {topEmoji.emoji} is clearly your favorite expression</li>
            <li>• You used {topEmojis.length} different emoji types</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
