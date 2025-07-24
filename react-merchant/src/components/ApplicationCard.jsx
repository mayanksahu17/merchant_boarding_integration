import React from 'react';

const ApplicationCard = ({ 
  application, 
  onDelete, 
  onSubmit, 
  onView, 
  onGenerateLink,
  onDownloadPDF 
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{application.applicationName || 'Unnamed Application'}</h4>
          <p className="text-gray-400 text-sm">Key: {application.externalKey}</p>
          <p className="text-gray-400 text-sm">Status: {application.status}</p>
          <p className="text-gray-400 text-sm">Created: {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(application.externalKey)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            title="View Application"
          >
            👁️ View
          </button>
          <button
            onClick={() => onGenerateLink(application.externalKey)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            title="Generate Link"
          >
            🔗 Link
          </button>
          <button
            onClick={() => onDownloadPDF(application.externalKey)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            title="Download PDF"
          >
            📄 PDF
          </button>
          <button
            onClick={() => onSubmit(application.externalKey)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
            title="Submit to Underwriting"
          >
            📤 Submit
          </button>
          <button
            onClick={() => onDelete(application.externalKey)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            title="Delete Application"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;