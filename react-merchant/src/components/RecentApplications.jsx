import { useState } from 'react';
import ApplicationCard from './ApplicationCard';
import { downloadApplicationPDF } from '../services/api';

const RecentApplications = ({ 
  applications, 
  onDelete, 
  onSubmit, 
  onView, 
  onRefresh,
  onGenerateLink
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadPDF = async (externalKey) => {
    setDownloadingPDF(true);
    try {
      await downloadApplicationPDF(externalKey);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // You might want to show an error message to the user here
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Recent Applications</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
          title="Refresh Applications"
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <h4 className="text-lg text-gray-300 mb-2">No applications yet</h4>
            <p className="text-gray-500">Create your first application to see it here</p>
          </div>
        ) : (
          applications.map(app => (
            <ApplicationCard
              key={app.externalKey}
              application={app}
              onDelete={onDelete}
              onSubmit={onSubmit}
              onView={onView}
              onGenerateLink={onGenerateLink}
              onDownloadPDF={handleDownloadPDF}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentApplications;