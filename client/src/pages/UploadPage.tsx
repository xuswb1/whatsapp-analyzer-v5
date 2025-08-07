import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a ZIP file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('chatFile', file);

      const response = await fetch('/api/upload-chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      
      // Navigate to results page
      setTimeout(() => {
        navigate(`/results/${result.sessionId}`);
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    if (isUploading && uploadProgress < 90) {
      const timer = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isUploading, uploadProgress]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Upload className="h-6 w-6 text-purple-600" />
            Upload Your WhatsApp Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isUploading ? (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center">
                  <FileText className="h-16 w-16 text-purple-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium mb-2">Select your exported WhatsApp chat ZIP file</p>
                  <p className="text-sm text-gray-600">
                    Make sure it's the ZIP file exported from WhatsApp containing your chat history
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />

                {file && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      📁 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">❌ {error}</p>
                  </div>
                )}

                <Button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                  size="lg"
                >
                  {isUploading ? 'Analyzing Your Chat...' : 'Start Analysis 🚀'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
              
              <div>
                <p className="text-lg font-medium mb-4">Analyzing your chat...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>🔍 Parsing messages...</p>
                <p>📊 Analyzing patterns...</p>
                <p>🎉 Generating insights...</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">How to export your WhatsApp chat:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Open WhatsApp and go to the chat you want to analyze</li>
              <li>Tap the chat name at the top → Export Chat</li>
              <li>Choose "Without Media" and save as ZIP file</li>
              <li>Upload the ZIP file here</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
