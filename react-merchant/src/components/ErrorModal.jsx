import React from 'react';

const ErrorModal = ({ errors, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Validation Errors</h2>
        <ul>
          {Object.entries(errors).map(([field, messages]) => (
            <li key={field} className="mb-2">
              <strong>{field}:</strong>
              <ul>
                {messages.map((message, index) => (
                  <li key={index} className="text-red-500">{message}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
