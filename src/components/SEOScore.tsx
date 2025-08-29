import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface SEOScoreProps {
  score: number;
}

const SEOScore: React.FC<SEOScoreProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep <= steps) {
        setAnimatedScore(increment * currentStep);
        currentStep++;
      } else {
        setAnimatedScore(score);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 9) return 'text-green-500';
    if (score >= 8) return 'text-blue-500';
    if (score >= 7) return 'text-orange-500';
    return 'text-red-500';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 10) * circumference;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${getProgressColor(score)}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(score)}`}>
              {animatedScore.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>SEO Score</span>
          </h3>
          <p className="text-gray-600">
            {score >= 9 ? 'Excellent' : score >= 8 ? 'Very Good' : score >= 7 ? 'Good' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm text-gray-600">
          Your listing is optimized for Etsy's search algorithm
        </p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full ${
                  i < Math.ceil(score / 2) ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOScore;