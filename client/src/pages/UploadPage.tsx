import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      // Check if all files are ZIP files
      const invalidFiles = Array.from(selectedFiles).filter(
        file => !file.type.includes('zip') && !file.name.endsWith('.zip')
      );
      
      if (invalidFiles.length > 0) {
        setError(`Please select only ZIP files. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      if (selectedFiles.length > 10) {
        setError('Maximum 10 files allowed');
        return;
      }
      
      setFiles(selectedFiles);
      setError(null);
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    fileArray.splice(indexToRemove, 1);
    
    // Create new FileList
    const dt = new DataTransfer();
    fileArray.forEach(file => dt.items.add(file));
    setFiles(dt.files.length > 0 ? dt.files : null);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('chatFiles', file);
      });

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
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isUploading, uploadProgress]);

  const totalSize = files ? Array.from(files).reduce((sum, file) => sum + file.size, 0) : 0;

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
          <CardTitle className="text-2xl flex items-center justify-center gap-2 text-gray-800">
            <Upload className="h-6 w-6 text-purple-600" />
            Upload Your WhatsApp Chats
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
                  <p className="text-lg font-medium mb-2 text-gray-800">Select your exported WhatsApp chat ZIP files</p>
                  <p className="text-sm text-gray-700">
                    You can upload multiple ZIP files (max 10). If they're from the same person, we'll merge them for a comprehensive analysis.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".zip"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />

                {files && files.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        📁 {files.length} file{files.length > 1 ? 's' : ''} selected ({(totalSize / 1024 / 1024).toFixed(2)} MB total)
                      </p>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {Array.from(files).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-gray-800">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="p-1 h-6 w-6 hover:bg-red-100"
                          >
                            <X className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">❌ {error}</p>
                  </div>
                )}

                <Button 
                  onClick={handleUpload}
                  disabled={!files || files.length === 0 || isUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                  size="lg"
                >
                  {isUploading ? 'Analyzing Your Chat...' : `Start Analysis 🚀${files && files.length > 1 ? ` (${files.length} files)` : ''}`}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
              
              <div>
                <p className="text-lg font-medium mb-4 text-gray-800">
                  Analyzing your chat{files && files.length > 1 ? 's' : ''}...
                </p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-700 mt-2">{uploadProgress}% complete</p>
              </div>
              
              <div className="text-sm text-gray-700 space-y-1">
                <p>🔍 Parsing messages...</p>
                {files && files.length > 1 && <p>🔗 Merging chat data...</p>}
                <p>📊 Analyzing patterns...</p>
                <p>🎉 Generating insights...</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2 text-gray-800">How to export your WhatsApp chat:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open WhatsApp and go to the chat you want to analyze</li>
              <li>Tap the chat name at the top → Export Chat</li>
              <li>Choose "Without Media" and save as ZIP file</li>
              <li>Upload the ZIP file(s) here</li>
              <li>For multiple chats from the same person, upload all ZIP files together</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
