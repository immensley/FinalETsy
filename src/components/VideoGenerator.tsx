import React, { useState } from 'react';
import { Play, Download, RefreshCw } from 'lucide-react';
import ComplianceChecklist from './ComplianceChecklist';

interface VideoGeneratorProps {
  image: string;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ image }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    
    // Simulate video generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsGenerating(false);
    setVideoGenerated(true);
    showNotification('Video generated successfully!');
  };

  return (
    <div>
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Generator</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Etsy Video</h3>
          
          {!videoGenerated ? (
            <div className="bg-gray-100 rounded-lg aspect-[4/3] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">Video preview will appear here</p>
                <button
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all mx-auto ${
                    isGenerating
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Generate Etsy Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-gray-900 rounded-lg aspect-[4/3] flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p>4:3 Etsy Video Preview</p>
                  <p className="text-sm text-gray-300">1080x810 • 8 seconds • Silent</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Download MP4</span>
                </button>
                <button 
                  onClick={generateVideo}
                  className="flex items-center space-x-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Compliance</h3>
          <div className="space-y-3 mb-6">
            {[
              '✅ 4:3 Aspect Ratio',
              '✅ 1080p+ Resolution',
              '✅ Silent Audio',
              '✅ 3-15s Duration'
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <span className="text-green-800 font-medium">{item}</span>
              </div>
            ))}
          </div>

          {videoGenerated && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Generated Video Title:</h4>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-gray-900">Handmade Sterling Silver Moon Phase Necklace - Celestial Jewelry</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Video Tags:</h4>
                <div className="flex flex-wrap gap-1">
                  {['moon jewelry', 'celestial necklace', 'handmade silver', 'boho jewelry'].map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;