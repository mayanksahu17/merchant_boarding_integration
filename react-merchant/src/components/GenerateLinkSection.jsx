import { useState, useEffect } from 'react';

const GenerateLinkSection = ({ 
  applications, 
  merchantLink,
  applicationEmail,
  externalKey,
  onGenerateLink, 
  onSendEmail,
  onCopyLink,
  setMerchantLink,
  setStatus
}) => {
  const [selectedKey, setSelectedKey] = useState(externalKey || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update selectedKey when externalKey prop changes
  useEffect(() => {
    if (externalKey) {
      setSelectedKey(externalKey);
    }
  }, [externalKey]);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { link } = await onGenerateLink(selectedKey);
      setMerchantLink(link);
      setStatus({ message: 'Merchant link generated!', type: 'success' });
      return link;
    } catch (err) {
      setError(err.message || 'Failed to generate link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSendEmail(applicationEmail, selectedKey);
      setStatus({ message: 'Email sent successfully!', type: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSelect = (key) => {
    setSelectedKey(key);
    const app = applications.find(app => app.externalKey === key);
    if (app && app.applicationEmail) {
      // Let parent component handle email state
      onSendEmail(app.applicationEmail, key);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Generate Merchant Link</h3>
      <div className="mb-4">
        <label htmlFor="linkExternalKey" className="block text-gray-300 mb-1">
          External Key for Merchant Link:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="linkExternalKey"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            placeholder="Enter external key"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
          <button
            onClick={handleGenerateLink}
            disabled={!selectedKey || isLoading}
            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded ${isLoading ? 'btn-loading' : ''}`}
          >
            {isLoading ? 'Generating...' : 'Generate Link'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-600 text-white rounded-md">
          {error}
        </div>
      )}

      {merchantLink && (
        <div className="bg-gray-700 p-4 rounded-md mb-4">
          <div className="font-semibold text-gray-300 mb-2">Merchant Link:</div>
          <div className="flex items-center gap-2 mb-4">
            <a
              href={merchantLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
            >
              {merchantLink}
            </a>
            <button
              onClick={onCopyLink}
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              📋 Copy
            </button>
          </div>

          <div className="pt-4 border-t border-gray-600">
            <label htmlFor="linkEmailAddress" className="block text-gray-300 mb-1">
              Send link via email:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id="linkEmailAddress"
                value={applicationEmail || ''}           
                placeholder="Email will be auto-filled"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
              <button
                onClick={handleSendEmail}
                disabled={!applicationEmail || isLoading}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${isLoading ? 'btn-loading' : ''}`}
              >
                {isLoading ? 'Sending...' : '📧 Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {applications.length > 0 && (
        <div className="mt-4">
          <label className="block text-gray-300 mb-1">Quick Select:</label>
          <div className="flex flex-wrap gap-2">
            {applications.slice(0, 3).map(app => (
              <button
                key={app.externalKey}
                onClick={() => handleApplicationSelect(app.externalKey)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm"
              >
                {app.externalKey}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateLinkSection;