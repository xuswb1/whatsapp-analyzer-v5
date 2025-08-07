import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertTriangle, Star } from 'lucide-react';

interface AdvancedAnalysisProps {
  analysis: {
    insights: {
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
  };
}

export function AdvancedAnalysis({ analysis }: AdvancedAnalysisProps) {
  const { insights } = analysis;
  
  return (
    <div className="space-y-6">
      {/* Main Analysis Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Communication Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.activityAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              Response Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.responseAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Language & Tone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.languageAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-yellow-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-yellow-600" />
              Emoji Expression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.emojiAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-indigo-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Timing Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.timeAnalysis}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-teal-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-600" />
              Group Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">
              {insights.analysis.dynamicsAnalysis}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Red Flags Section */}
      {insights.analysis.redFlags && insights.analysis.redFlags.length > 0 && (
        <Card className="bg-red-50 border border-red-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Potential Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.analysis.redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{flag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standout Moments Section */}
      {insights.analysis.standoutMoments && insights.analysis.standoutMoments.length > 0 && (
        <Card className="bg-amber-50 border border-amber-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Standout Moments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.analysis.standoutMoments.map((moment, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{moment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Detection Info */}
      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          Analysis performed in: <strong>{insights.analysis.language}</strong>
        </p>
      </div>
    </div>
  );
}
