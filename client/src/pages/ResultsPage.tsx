import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { StatsOverview } from '@/components/results/StatsOverview';
import { EmojiAnalysis } from '@/components/results/EmojiAnalysis';
import { TimeAnalysis } from '@/components/results/TimeAnalysis';
import { ParticipantRoles } from '@/components/results/ParticipantRoles';
import { WordCloud } from '@/components/results/WordCloud';

interface ChatAnalysis {
  sessionId: string;
  fileName: string;
  totalMessages: number;
  participants: string[];
  messageStats: Record<string, number>;
  emojiStats: Record<string, number>;
  timeStats: {
    hourlyActivity: Record<string, number>;
    monthlyActivity: Record<string, number>;
  };
  insights: {
    roles: Record<string, string>;
    dynamics: string[];
    topEmojis: Array<{ emoji: string; count: number }>;
    topWords: Array<{ word: string; count: number }>;
  };
  createdAt: string;
}

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [analysis, setAnalysis] = React.useState<ChatAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnalysis = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`/api/analysis/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Analysis not found');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading your Chat Rewind...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Oops! 😅</h2>
          <p className="text-gray-600 mb-6">{error || 'Analysis not found'}</p>
          <Link to="/upload">
            <Button className="bg-gradient-to-r from-purple-600 to-teal-600">
              Try Another Chat
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Your Chat Rewind 2024 ✨
        </h1>
        <p className="text-lg text-gray-600">
          Here's your year in {analysis.fileName.replace('.zip', '')} 📱
        </p>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-8">
        <StatsOverview analysis={analysis} />
        <EmojiAnalysis analysis={analysis} />
        <ParticipantRoles analysis={analysis} />
        <WordCloud analysis={analysis} />
        <TimeAnalysis analysis={analysis} />
      </div>

      {/* Footer */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Want to analyze another chat? 🤔</h3>
        <Link to="/upload">
          <Button className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700">
            Upload Another Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
