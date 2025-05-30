import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function DeploymentStatus({ status, progress, onClose }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'deploying':
        return <Loader className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'deploying':
        return 'Deploying your DAO to the Internet Computer...';
      case 'success':
        return 'DAO deployed successfully!';
      case 'error':
        return 'Deployment failed. Please try again.';
      default:
        return '';
    }
  };

  if (!status) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center space-x-4 mb-4">
          {getStatusIcon()}
          <h3 className="text-lg font-semibold text-gray-900">
            {status === 'deploying' ? 'Deploying DAO' : status === 'success' ? 'Success!' : 'Error'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4">{getStatusMessage()}</p>
        
        {status === 'deploying' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {status !== 'deploying' && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {status === 'success' ? 'Continue' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}