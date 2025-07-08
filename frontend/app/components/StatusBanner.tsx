import React, { useEffect } from 'react';

const statusClasses = {
  success: 'bg-green-900 border-green-700',
  error: 'bg-red-900 border-red-700',
  info: 'bg-blue-900 border-blue-700'
};

const StatusBanner: React.FC<{ 
  status: { message: string; type: 'success' | 'error' | 'info' } | null;
  onDismiss: () => void;
}> = ({ status, onDismiss }) => {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => onDismiss(), 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  if (!status) return null;

  return (
    <div className={`${statusClasses[status.type]} border rounded-lg p-4 mb-4 flex justify-between items-center`}>
      <p>{status.message}</p>
      <button 
        onClick={onDismiss}
        className="text-white hover:text-gray-300"
      >
        ✕
      </button>
    </div>
  );
};

export default StatusBanner;