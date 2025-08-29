import React from 'react';
import { CheckCircle } from 'lucide-react';

const ComplianceChecklist = () => {
  const checks = [
    { label: 'August 2025 Compliant', icon: CheckCircle, color: 'green' },
    { label: 'Mobile-First Optimized', icon: CheckCircle, color: 'blue' },
    { label: 'Attribute Coverage', icon: CheckCircle, color: 'orange' },
    { label: '13-Tag Strategy', icon: CheckCircle, color: 'purple' }
  ];

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
        August 2025 Compliance Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {checks.map((check, index) => (
          <div key={index} className={`flex items-center space-x-3 bg-white p-4 rounded-lg border-2 transition-all hover:shadow-md ${
            check.color === 'green' ? 'border-green-200 hover:border-green-300' :
            check.color === 'blue' ? 'border-blue-200 hover:border-blue-300' :
            check.color === 'orange' ? 'border-orange-200 hover:border-orange-300' :
            'border-purple-200 hover:border-purple-300'
          }`}>
            <check.icon className={`h-6 w-6 flex-shrink-0 ${
              check.color === 'green' ? 'text-green-500' :
              check.color === 'blue' ? 'text-blue-500' :
              check.color === 'orange' ? 'text-orange-500' :
              'text-purple-500'
            }`} />
            <span className={`font-medium text-sm ${
              check.color === 'green' ? 'text-green-800' :
              check.color === 'blue' ? 'text-blue-800' :
              check.color === 'orange' ? 'text-orange-800' :
              'text-purple-800'
            }`}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceChecklist;