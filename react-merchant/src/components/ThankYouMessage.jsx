// src/components/ThankYouMessage.jsx
const ThankYouMessage = ({ submissionResponse, validationResponse, onBack }) => {
  return (
    <div className="thank-you-message text-center p-8 bg-white rounded-lg shadow-md">
      <div className="success-icon text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <p className="mb-4">Your merchant application has been successfully submitted.</p>
      
      <div className="application-number mb-6">
        {/* Application ID:  */}
        <span className="font-semibold">
          {submissionResponse?.applicationId || submissionResponse?.id || 'Pending'}
        </span>
      </div>
      
      {/* Add validation status display */}
      
      <button 
        onClick={onBack}
        className="mt-6 px-4 py-2 bg-gray-200 rounded"
      >
        ← Back to Form
      </button>
    </div>
  );
};

export default ThankYouMessage;