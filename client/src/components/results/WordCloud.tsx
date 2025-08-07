import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Hash } from 'lucide-react';

interface WordCloudProps {
  analysis: {
    insights: {
      topWords: Array<{ word: string; count: number }>;
    };
  };
}

export function WordCloud({ analysis }: WordCloudProps) {
  const { topWords } = analysis.insights;

  if (!topWords || topWords.length === 0) {
    return (
      <Card className="text-center p-6 bg-white border border-green-200">
        <MessageCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2 text-gray-800">No Common Words Found</h3>
        <p className="text-gray-700">This chat keeps things unique! 🦋</p>
      </Card>
    );
  }

  const maxCount = topWords[0]?.count || 1;

  const getFontSize = (count: number) => {
    const ratio = count / maxCount;
    const minSize = 12;
    const maxSize = 24;
    return Math.round(minSize + (maxSize - minSize) * ratio);
  };

  const getColor = (index: number) => {
    const colors = [
      'text-purple-700', 'text-blue-700', 'text-teal-700', 
      'text-green-700', 'text-orange-700', 'text-pink-700',
      'text-indigo-700', 'text-red-700', 'text-cyan-700', 'text-gray-700'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-white border border-green-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl flex items-center justify-center gap-2 text-gray-800">
          <Hash className="h-5 w-5 text-green-600" />
          Most Used Words
        </CardTitle>
        <p className="text-gray-700 text-sm">Your chat vocabulary revealed</p>
      </CardHeader>
      
      <CardContent>
        {/* Word Cloud Visual */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-3 min-h-[120px]">
            {topWords.slice(0, 15).map((wordItem, index) => (
              <span
                key={wordItem.word}
                className={`font-bold hover:scale-105 transition-transform cursor-default ${getColor(index)}`}
                style={{ fontSize: `${getFontSize(wordItem.count)}px` }}
                title={`Used ${wordItem.count} times`}
              >
                {wordItem.word}
              </span>
            ))}
          </div>
        </div>

        {/* Top 8 Words List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-center mb-3 text-gray-800">Top Words</h4>
          <div className="grid grid-cols-2 gap-2">
            {topWords.slice(0, 8).map((wordItem, index) => (
              <div key={wordItem.word} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs ${getColor(index)}`}>#{index + 1}</span>
                  <span className="font-medium text-xs text-gray-800">{wordItem.word}</span>
                </div>
                <span className="font-bold text-xs text-gray-800">{wordItem.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Insights */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-2 text-gray-800">💭 Word Insights:</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Your most-used word: <strong>"{topWords[0]?.word}"</strong> ({topWords[0]?.count} times)</li>
            <li>• Rich vocabulary of {topWords.length} unique words</li>
            <li>• Your style is {topWords.length > 50 ? 'descriptive and varied' : 'concise and direct'} 📝</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
