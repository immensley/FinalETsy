import React, { useState } from 'react';
import { Play, Upload, Download, RefreshCw, CheckCircle } from 'lucide-react';
import FileUploader from '../components/FileUploader';

const VideoStudio = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [notification, setNotification] = useState('');

  const compliance = [
    { label: '4:3 Aspect Ratio', checked: true },
    { label: '1080p+ Resolution', checked: true },
    { label: 'Silent Audio', checked: true },
    { label: '3-15s Duration', checked: true }
  ];

  const generateVideo = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setIsGenerating(false);
    setVideoGenerated(true);
    setNotification('Video generated successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Studio</h1>
        <p className="text-gray-600">Create Etsy-compliant product videos that boost conversion rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload & Generate */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Product Photo</h2>
            <FileUploader onImageUpload={setUploadedImage} />
          </div>

          {uploadedImage && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Generation</h2>
              
              {!videoGenerated ? (
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg aspect-[4/3] flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Video preview will appear here</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateVideo}
                    disabled={isGenerating}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all w-full justify-center transform ${
                      isGenerating
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Creating Video...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Create Etsy Video</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-900 rounded-lg aspect-[4/3] flex items-center justify-center mb-4">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-2" />
                      <p className="text-lg font-medium">Etsy Product Video</p>
                      <p className="text-sm text-gray-300">1080x810 • 8 seconds • Silent</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        // Download functionality
                        setNotification('Video downloaded successfully!');
                        setTimeout(() => setNotification(''), 3000);
                      }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg transform hover:scale-105 flex-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download MP4</span>
                    </button>
                    <button 
                      onClick={generateVideo}
                      className="flex items-center space-x-2 border-2 border-blue-500 hover:bg-blue-500 hover:text-white text-blue-600 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg transform hover:scale-105"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Compliance & Generated Content */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Compliance</h2>
            <div className="space-y-3">
              {compliance.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-green-200">
                  <CheckCircle className={`h-5 w-5 ${
                    item.checked ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  <span className={`font-medium ${
                    item.checked ? 'text-green-800' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {videoGenerated && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Video Title:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">Handmade Sterling Silver Moon Phase Necklace - Celestial Jewelry</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Video Tags (13):</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'moon jewelry', 'celestial necklace', 'handmade silver', 'boho jewelry',
                      'lunar pendant', 'moon phases', 'sterling silver', 'celestial gift',
                      'boho style', 'moon necklace', 'space jewelry', 'witchy jewelry', 'handcrafted'
                    ].map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Etsy Video Best Practices</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep videos between 5-15 seconds for best engagement</li>
              <li>• Show your product from multiple angles</li>
              <li>• Highlight key features and details</li>
              <li>• Use natural lighting for best quality</li>
              <li>• Videos can increase conversion rates by up to 80%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;