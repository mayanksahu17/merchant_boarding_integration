import { useState, useEffect } from 'react';
import { PLAN_DATA } from '../constants';

const CreateApplicationForm = ({ onSubmit, externalKey, setExternalKey, onCopyKey }) => {
  const [formData, setFormData] = useState({
    applicationName: "Joe's Spaceage Stereo - Vermont",
    planId: "",
    abaRouting: "021000021",
    email: ""
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      planId: "115593"
    }));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      externalKey
    });
  };

  const generateNewKey = () => {
    setExternalKey("EXT" + Math.floor(Math.random() * 1e14));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">Create New Application</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="applicationName" className="block text-gray-300 mb-1">Application Name</label>
            <input
              type="text"
              id="applicationName"
              value={formData.applicationName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="externalKey" className="block text-gray-300 mb-1">External Key</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="externalKey"
                value={externalKey}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
              <button
                type="button"
                onClick={onCopyKey}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-md"
              >
                📋 Copy
              </button>
              <button
                type="button"
                onClick={generateNewKey}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-md"
                title="Generate new key"
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="planId" className="block text-gray-300 mb-1">Plan ID</label>
            <select
              id="planId"
              value={formData.planId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select a Plan</option>
              {PLAN_DATA.planDetails.map(plan => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.isFavoritePlan ? '⭐ ' : ''}{plan.planName} (ID: {plan.planId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="abaRouting" className="block text-gray-300 mb-1">ABA Routing Number</label>
            <input
              type="text"
              id="abaRouting"
              value={formData.abaRouting}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email for application notifications"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Application
        </button>
      </form>
    </div>
  );
};

export default CreateApplicationForm;