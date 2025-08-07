import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, BarChart3, Heart, Sparkles } from 'lucide-react';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-2 mb-6">
          <MessageCircle className="h-12 w-12 text-purple-600" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Chat Rewind
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get your WhatsApp year in review! 📊 Discover your chat patterns, emoji obsessions, 
          and friendship dynamics with a fun Spotify Wrapped-style analysis ✨
        </p>
        
        <Link to="/upload">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-4 text-lg">
            Start Your Chat Rewind 🚀
          </Button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
          <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Message Analytics</h3>
          <p className="text-gray-600 text-sm">
            See who texts the most, message patterns over time, and chat activity insights
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-teal-200">
          <Sparkles className="h-12 w-12 text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Emoji Wrapped</h3>
          <p className="text-gray-600 text-sm">
            Discover your most-used emojis and become the emoji champion of your group
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200">
          <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Friendship Roles</h3>
          <p className="text-gray-600 text-sm">
            Get fun labels like "Double Texter", "Emoji Overuser", or "Ghosting Champ"
          </p>
        </Card>
      </div>

      {/* How It Works */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
              1
            </div>
            <h3 className="font-semibold">Export Your Chat</h3>
            <p className="text-sm text-gray-600">Export your WhatsApp chat as a ZIP file from your phone</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
              2
            </div>
            <h3 className="font-semibold">Upload & Analyze</h3>
            <p className="text-sm text-gray-600">Upload your file and let our AI analyze your chat patterns</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
              3
            </div>
            <h3 className="font-semibold">Get Your Rewind</h3>
            <p className="text-sm text-gray-600">Discover insights, share with friends, and laugh at your patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
