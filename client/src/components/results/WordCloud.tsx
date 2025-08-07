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
      <Card className="text-center p-8 border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
        <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Common Words Found</h3>
        <p className="text-gray-600">This chat keeps things unique! 🦋</p>
      </Card>
    );
  }

  const maxCount = topWords[0]?.count || 1;

  const getFontSize = (count: number) => {
    const ratio = count / maxCount;
    const minSize = 14;
    const maxSize = 32;
    return Math.round(minSize + (maxSize - minSize) * ratio);
  };

  const getColor = (index: number) => {
    const colors = [
      'text-purple-600', 'text-blue-600', 'text-teal-600', 
      'text-green-600', 'text-yellow-600', 'text-pink-600',
      'text-indigo-600', 'text-red-600', 'text-orange-600', 'text-cyan-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-teal-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Hash className="h-6 w-6 text-green-600" />
          Most Used Words
        </CardTitle>
        <p className="text-gray-600">Your chat vocabulary revealed</p>
      </CardHeader>
      
      <CardContent>
        {/* Word Cloud Visual */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap justify-center items-center gap-4 min-h-[200px]">
            {topWords.slice(0, 20).map((wordItem, index) => (
              <span
                key={wordItem.word}
                className={`font-bold hover:scale-110 transition-transform cursor-default ${getColor(index)}`}
                style={{ fontSize: `${getFontSize(wordItem.count)}px` }}
                title={`Used ${wordItem.count} times`}
              >
                {wordItem.word}
              </span>
            ))}
          </div>
        </div>

        {/* Top 10 Words List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-center mb-4">Top 10 Words</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {topWords.slice(0, 10).map((wordItem, index) => (
              <div key={wordItem.word} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getColor(index)}`}>#{index + 1}</span>
                  <span className="font-medium">{wordItem.word}</span>
                </div>
                <span className="font-bold text-lg">{wordItem.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg">
          <h4 className="font-semibold mb-2">💭 Word Insights:</h4>
          <ul className="text-sm space-y-1">
            <li>• Your most-used word: <strong>"{topWords[0]?.word}"</strong> ({topWords[0]?.count} times)</li>
            <li>• You have a rich vocabulary of {topWords.length} unique words</li>
            <li>• Your chat style is {topWords.length > 50 ? 'descriptive and varied' : 'concise and direct'} 📝</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
