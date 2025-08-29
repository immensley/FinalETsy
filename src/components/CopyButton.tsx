import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  compact?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMessage('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to copy');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const showNotification = message && (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-slide-in">
      <CheckCircle className="h-4 w-4" />
      {message}
    </div>
  );

  if (compact) {
    return (
      <>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all hover:shadow-md transform hover:scale-105 ${
            copied
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          {copied ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
        {showNotification}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleCopy}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-all transform hover:scale-105 ${
          copied
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="text-sm font-medium">Copy</span>
          </>
        )}
      </button>
      {showNotification}
    </>
  );
};

export default CopyButton;