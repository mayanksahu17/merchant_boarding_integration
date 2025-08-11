import React, { useState, useEffect } from 'react';
import { uploadDocument, getDocumentTypes } from '../services/api';

const DocumentUpload = ({ externalKey, documents, onDocumentUpdate, bankVerificationRequired }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await getDocumentTypes();
        if (response.status === 'success' && Array.isArray(response.data)) {
          setDocumentTypes(response.data);
        } else {
          setError('Invalid document types data received');
        }
      } catch (error) {
        console.error('Error fetching document types:', error);
        setError('Failed to load document types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (6MB limit)
      if (file.size > 6 * 1024 * 1024) {
        setError('File size exceeds 6MB limit');
        return;
      }

      // Check file type
      const validTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/tiff', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Allowed types: PNG, GIF, JPEG, TIFF, PDF');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      setError('Please select both a file and document type');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadDocument(externalKey, selectedFile, selectedType);
      onDocumentUpdate(response.document);
      setSelectedFile(null);
      setSelectedType('');
      document.getElementById('file-upload').value = '';
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading document types...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Document Upload</h3>
        
        {bankVerificationRequired && (
          <div className="mb-4 p-4 bg-yellow-600 text-white rounded">
            ⚠️ Bank verification document required before submission
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
            >
              <option value="">Select document type</option>
              {documentTypes.map((docType) => (
                <option key={docType.fileType} value={docType.fileType}>
                  {docType.fileTypeDescription}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
              accept=".pdf,.png,.gif,.jpeg,.jpg,.tiff"
            />
            <p className="mt-1 text-sm text-gray-400">
              Max file size: 6MB. Supported formats: PDF, PNG, GIF, JPEG, TIFF
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedType || isUploading}
            className={`w-full px-4 py-2 rounded font-medium ${
              isUploading || !selectedFile || !selectedType
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Uploaded Documents</h4>
          <div className="space-y-3">
            {documents.map((doc) => {
              // Find the document type description
              const docTypeInfo = documentTypes.find(dt => dt.fileType === doc.type) || { fileTypeDescription: doc.type };
              return (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 bg-gray-600 rounded"
                >
                  <div>
                    <p className="text-white">{docTypeInfo.fileTypeDescription}</p>
                    <p className="text-sm text-gray-400">{doc.originalName}</p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;  