import React from 'react';

const ApplicationCard = ({ application, onSubmit, onDelete, onView, onGenerateLink }) => {
  const documentTypes = {
    voided_check: 'Voided Check',
    bank_statement: 'Bank Statement',
    processing_statement: 'Processing Statement'
  };

  const getBankDocumentStatus = () => {
    const bankDocs = application.documents?.filter(doc => 
      ['voided_check', 'bank_statement', 'processing_statement'].includes(doc.type)
    ) || [];

    if (bankDocs.length === 0) {
      return (
        <span className="text-yellow-400">
          ⚠️ Bank verification document required
        </span>
      );
    }

    const uploadedDoc = bankDocs[0];
    return (
      <div>
        <span className="text-green-400">✓ Bank verification document uploaded</span>
        <div className="text-sm text-gray-400 mt-1">
          {documentTypes[uploadedDoc.type]}: {' '}
          <a 
            href={uploadedDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {uploadedDoc.originalName}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-200">
            {application.applicationName || 'Unnamed Application'}
          </h3>
          <p className="text-gray-400">Key: {application.externalKey}</p>
          <p className="text-gray-400">Status: {application.status}</p>
          <div className="mt-4">
            <div className="mb-2">{getBankDocumentStatus()}</div>
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onView(application.externalKey)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View
          </button>
          <button
            onClick={() => onGenerateLink(application.externalKey)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generate Link
          </button>
          <button
            onClick={() => onSubmit(application.externalKey)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            disabled={application.status === 'submitted_to_underwriting' || !application.documents?.some(doc => 
              ['voided_check', 'bank_statement', 'processing_statement'].includes(doc.type)
            )}
            title={!application.documents?.some(doc => 
              ['voided_check', 'bank_statement', 'processing_statement'].includes(doc.type)
            ) ? 'Bank verification document required before submission' : ''}
          >
            Submit
          </button>
          <button
            onClick={() => onDelete(application.externalKey)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;