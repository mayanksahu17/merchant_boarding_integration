import React from 'react';
import { Application } from '../types/types';
import StatusIndicator from './StatusIndicator';

interface ApplicationCardProps {
  application: Application;
  onView: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  onGenerateLink: () => void;
  showSubmit: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onView,
  onSubmit,
  onDelete,
  onGenerateLink,
  showSubmit
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 hover:border-white rounded-xl p-5 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{application.applicationName}</h3>
        <StatusIndicator status={application.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase">External Key</p>
          <p className="font-medium">{application.externalKey}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Plan ID</p>
          <p className="font-medium">{application.planId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Email</p>
          <p className="font-medium">{application.email || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Created</p>
          <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase">Last Updated</p>
          <p className="font-medium">{new Date(application.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {application.emailHistory?.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 uppercase mb-2">📧 Email History</p>
          <div className="space-y-1">
            {application.emailHistory.slice(-3).map((email, i) => (
              <p key={i} className="text-xs text-gray-400">
                {new Date(email.sentAt).toLocaleDateString()} - {email.type} {email.success ? '✅' : '❌'}
              </p>
            ))}
            {application.emailHistory.length > 3 && (
              <p className="text-xs text-gray-500">+{application.emailHistory.length - 3} more</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onGenerateLink}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Generate Link
        </button>
        <button
          onClick={onView}
          className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-sm transition-colors"
        >
          View Details
        </button>
        {showSubmit && (
          <button
            onClick={onSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🚀 Submit
          </button>
        )}
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;