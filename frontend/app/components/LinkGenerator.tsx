import React, { useState, useEffect } from 'react';
import { API_URL } from '../utils/constants';

interface LinkGeneratorProps {
  selectedKey: string | null;
  onGenerateLink: (key: string) => void;
}

const LinkGenerator: React.FC<LinkGeneratorProps> = ({ selectedKey, onGenerateLink }) => {
  const [externalKey, setExternalKey] = useState('');
  const [email, setEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    if (selectedKey) {
      setExternalKey(selectedKey);
    }
  }, [selectedKey]);

  const handleGenerate = () => {
    if (!externalKey) return;
    
    const link = `${window.location.origin}/merchant-form?key=${encodeURIComponent(externalKey)}`;
    setGeneratedLink(link);
    onGenerateLink(externalKey);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  const sendEmail = async () => {
    if (!email || !externalKey) return;
    
    try {
      const response = await fetch(`${API_URL}/api/send-merchant-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, externalKey })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Merchant link sent successfully!');
      setEmail('');
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Failed to send merchant link');
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white flex items-center gap-3 mb-6">
        <span className="w-1 h-6 bg-white rounded-full"></span>
        Generate Merchant Link
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">External Key for Merchant Link</label>
          <input
            type="text"
            value={externalKey}
            onChange={(e) => setExternalKey(e.target.value)}
            placeholder="Enter external key"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:outline-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Generate Merchant Link
        </button>

        {generatedLink && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="font-medium mb-2">Merchant Link:</p>
            <a 
              href={generatedLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
            >
              {generatedLink}
            </a>
            <button
              onClick={copyLink}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded ml-2 text-sm transition-colors"
            >
              📋 Copy Link
            </button>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="block text-sm font-medium text-white mb-2">Send link via email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none"
                />
                <button
                  onClick={sendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📧 Send Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkGenerator;