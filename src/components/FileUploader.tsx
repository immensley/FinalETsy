import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useOfflineSupport } from '../hooks/useOfflineSupport';
import { validateImageFile } from '../utils/helpers';

interface FileUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (analysis: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onImageUpload, 
  onAnalysisStart, 
  onAnalysisComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleError, currentError, clearError } = useErrorHandler();
  const { isOnline, addPendingUpload } = useOfflineSupport();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Clear any previous errors
    clearError();

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      handleError(new Error(validation.error || 'Invalid image file'), {
        operation: 'file_validation',
        fileType: file.type,
        fileSize: file.size
      });
      return;
    }

    processImage(file);
  };

  // Helper method to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processImage = async (file: File) => {
    if (!isOnline) {
      // Handle offline scenario
      const uploadId = addPendingUpload(file);
      handleError(new Error('You\'re offline. Your upload will be processed when connection is restored.'), {
        operation: 'offline_upload',
        uploadId
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisStep('🎨 Preparing your beautiful image...');
      onAnalysisStart?.();
      
      // Convert to base64
      const imageData = await fileToBase64(file);
      setUploadedImage(imageData);
      
      // Step 1: Vision AI Analysis
      setAnalysisStep('👁️ Teaching AI to see your product\'s beauty...');
      await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
      
      // Step 2: Claude 3 Processing
      setAnalysisStep('🧠 Claude 3 is getting creative with your product...');
      
      const result = await handleError(
        async () => await apiClient.analyzeProduct(imageData),
        { operation: 'analyze_product', fileSize: file.size },
        async () => await apiClient.analyzeProduct(imageData) // Retry function
      );
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Analysis failed');
      }
      
      // Step 3: Category Mapping
      setAnalysisStep('🗺️ Finding the perfect Etsy home for your creation...');
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay
      
      setIsAnalyzing(false);
      setAnalysisStep('');
      onImageUpload(imageData);
      onAnalysisComplete?.(result.data);
      
    } catch (error) {
      await handleError(error, {
        operation: 'image_processing',
        fileType: file.type,
        fileSize: file.size
      });
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              You're offline. Images will be processed when connection is restored.
            </p>
          </div>
        </div>
      )}
      
      {!uploadedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-25 hover:to-pink-25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center transition-all hover:from-purple-200 hover:to-pink-200 animate-float">
              <Upload className="h-10 w-10 text-purple-500 animate-wiggle" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✨ Drop your magical product photo here ✨
              </h3>
              <p className="text-gray-600 mb-4">
                or <span className="text-purple-500 font-medium hover:text-purple-600 transition-colors">browse to choose a file</span>
              </p>
              <p className="text-sm text-gray-500">
                📸 Supports JPG, PNG, WebP up to 10MB 🎨
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-6 border-2 border-purple-200">
          {isAnalyzing && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-purple-50/95 rounded-xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-2 w-12 h-12 border-2 border-transparent border-t-orange-400 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
                </div>
                <p className="text-purple-600 font-medium text-lg">{analysisStep}</p>
                <p className="text-sm text-purple-500 mt-2 flex items-center justify-center">
                  <span className="animate-pulse">🤖</span>
                  <span className="ml-2">Powered by Claude 3 + Vision AI</span>
                  <span className="animate-pulse ml-2">✨</span>
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded product"
                className="w-32 h-32 object-cover rounded-lg shadow-lg border-2 border-white hover:shadow-xl transition-shadow"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-red-500 hover:to-pink-600 transition-all hover:scale-110 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              {!isAnalyzing && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <ImageIcon className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900">
                  {isAnalyzing ? analysisStep : '🎉 Analysis complete!'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {isAnalyzing 
                  ? '🔍 Claude 3 is discovering the magic in your product...'
                  : '🚀 Ready to create your perfect Etsy listing!'
                }
              </p>
              
              {!isAnalyzing && (
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    clearError();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <span>🔄 Try a different image</span>
                </button>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default FileUploader;