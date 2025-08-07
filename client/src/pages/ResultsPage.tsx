import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { StatsOverview } from '@/components/results/StatsOverview';
import { CompactStatsOverview } from '@/components/results/CompactStatsOverview';
import { EmojiAnalysis } from '@/components/results/EmojiAnalysis';
import { TimeAnalysis } from '@/components/results/TimeAnalysis';
import { ParticipantRoles } from '@/components/results/ParticipantRoles';
import { WordCloud } from '@/components/results/WordCloud';
import { AdvancedAnalysis } from '@/components/results/AdvancedAnalysis';
import { CompactAnalysis } from '@/components/results/CompactAnalysis';
import { ViewToggle } from '@/components/results/ViewToggle';

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
    responseDelays: Record<string, number[]>;
  };
  insights: {
    roles: Record<string, string>;
    dynamics: string[];
    topEmojis: Array<{ emoji: string; count: number }>;
    topWords: Array<{ word: string; count: number }>;
    isMultiFile?: boolean;
    fileCount?: number;
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
  };
  createdAt: string;
}

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [analysis, setAnalysis] = React.useState<ChatAnalysis | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCompactView, setIsCompactView] = React.useState(false);

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

  const handleToggleView = React.useCallback(() => {
    setIsCompactView(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-800">Loading your Chat Rewind...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Oops! 😅</h2>
          <p className="text-gray-700 mb-6">{error || 'Analysis not found'}</p>
          <Link to="/upload">
            <Button className="bg-gradient-to-r from-purple-600 to-teal-600">
              Try Another Chat
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isMultiFile = analysis.insights.isMultiFile;
  const StatsComponent = isMultiFile ? CompactStatsOverview : StatsOverview;

  // Render compact view
  if (isCompactView) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Your Chat Rewind 2024 ✨
          </h1>
          <p className="text-base md:text-lg text-gray-700">
            {isMultiFile 
              ? `Combined analysis from ${analysis.insights.fileCount} chat files 📊` 
              : `Here's your year in ${analysis.fileName.replace('.zip', '')} 📱`
            }
          </p>
          {isMultiFile && (
            <p className="text-sm text-gray-600 mt-1">
              Files: {analysis.fileName}
            </p>
          )}
        </div>

        <ViewToggle isCompact={isCompactView} onToggle={handleToggleView} />
        
        <CompactAnalysis analysis={analysis} />

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white border border-purple-200 rounded-xl">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Want to analyze another chat? 🤔</h3>
          <Link to="/upload">
            <Button className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700">
              Upload Another Chat
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render wide view
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Your Chat Rewind 2024 ✨
        </h1>
        <p className="text-base md:text-lg text-gray-700">
          {isMultiFile 
            ? `Combined analysis from ${analysis.insights.fileCount} chat files 📊` 
            : `Here's your year in ${analysis.fileName.replace('.zip', '')} 📱`
          }
        </p>
        {isMultiFile && (
          <p className="text-sm text-gray-600 mt-1">
            Files: {analysis.fileName}
          </p>
        )}
      </div>

      <ViewToggle isCompact={isCompactView} onToggle={handleToggleView} />

      {/* Analysis Sections */}
      <div className="space-y-8">
        <StatsComponent analysis={analysis} />
        
        {/* Advanced Analysis - New comprehensive insights */}
        <AdvancedAnalysis analysis={analysis} />
        
        {/* Original components in compact layout for multi-file */}
        {isMultiFile ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <EmojiAnalysis analysis={analysis} />
            <WordCloud analysis={analysis} />
            <ParticipantRoles analysis={analysis} />
            <TimeAnalysis analysis={analysis} />
          </div>
        ) : (
          <>
            <EmojiAnalysis analysis={analysis} />
            <ParticipantRoles analysis={analysis} />
            <WordCloud analysis={analysis} />
            <TimeAnalysis analysis={analysis} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 p-6 bg-white border border-purple-200 rounded-xl">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Want to analyze another chat? 🤔</h3>
        <Link to="/upload">
          <Button className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700">
            Upload Another Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}
