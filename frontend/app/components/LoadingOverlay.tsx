import React from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = 'Processing...' }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="text-white mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;