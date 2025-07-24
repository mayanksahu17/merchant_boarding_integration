import React, { useState } from 'react';
import { uploadDocument, deleteDocument } from '../services/api';

const DocumentUpload = ({ externalKey, documents, onDocumentUpdate, bankVerificationRequired }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const bankDocumentTypes = [
    { 
      value: 'voided_check', 
      label: 'Voided Check',
      description: 'Voided check from the business bank account'
    },
    { 
      value: 'bank_statement', 
      label: 'Bank Statement',
      description: 'Recent bank statement (within last 3 months)'
    },
    { 
      value: 'processing_statement', 
      label: 'Processing Statement',
      description: 'Recent merchant processing statement'
    }
  ];

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadDocument(externalKey, file, type);
      onDocumentUpdate(result.document);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? You will need to upload another bank verification document.')) return;

    setIsUploading(true);
    setError(null);

    try {
      await deleteDocument(externalKey, documentId);
      onDocumentUpdate(null, documentId);
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    } finally {
      setIsUploading(false);
    }
  };

  const hasBankDocument = () => {
    return documents?.some(doc => 
      bankDocumentTypes.map(type => type.value).includes(doc.type)
    );
  };

  const getUploadedDocument = () => {
    return documents?.find(doc => 
      bankDocumentTypes.map(type => type.value).includes(doc.type)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Bank Account Verification</h3>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {bankVerificationRequired && (
          <div className="bg-yellow-600 text-white p-4 rounded-md mb-6">
            <p className="font-medium">Bank Account Verification Required</p>
            <p className="mt-2">
              We were unable to automatically verify this merchant's bank account information. 
              Please upload <span className="font-semibold">any one</span> of the following documents:
            </p>
          </div>
        )}

        <div className="bg-gray-700 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-gray-200 font-medium">
              Bank Verification Documents
              {bankVerificationRequired && !hasBankDocument() && (
                <span className="text-red-400 ml-2">* Any one required</span>
              )}
            </h4>
            {hasBankDocument() && (
              <span className="text-green-400 text-sm">✓ Bank verification document uploaded</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankDocumentTypes.map(({ value, label, description }) => {
              const uploadedDoc = documents?.find(doc => doc.type === value);
              const anyDocUploaded = hasBankDocument();
              const isDisabled = anyDocUploaded && !uploadedDoc;
              
              return (
                <div key={value} className={`p-4 bg-gray-600 rounded-lg ${isDisabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-gray-200 font-medium">
                      {label}
                      {uploadedDoc && <span className="text-green-400 ml-2">✓</span>}
                    </h5>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{description}</p>
                  
                  {uploadedDoc ? (
                    <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                      <a 
                        href={uploadedDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-[200px]"
                      >
                        {uploadedDoc.originalName}
                      </a>
                      <button
                        onClick={() => handleDelete(uploadedDoc._id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                        disabled={isUploading}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, value)}
                        className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          disabled:opacity-50"
                        disabled={isUploading || isDisabled}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      {isDisabled ? (
                        <p className="text-yellow-400 text-xs mt-1">
                          Another document is already uploaded. Delete it first to upload this type.
                        </p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">
                          Accepted formats: PDF, JPG, PNG, DOC
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;  