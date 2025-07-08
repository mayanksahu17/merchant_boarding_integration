import React from 'react';

type ThankYouMessageProps = {
  applicationId: string;
  validationData: any;
  onBack: () => void;
};

const ThankYouMessage: React.FC<ThankYouMessageProps> = ({ applicationId, validationData, onBack }) => {
  return (
    <div className="thank-you-message">
      <div className="success-icon">✅</div>
      <h2>Thank You!</h2>
      <p>Your merchant application has been successfully submitted.</p>
      <div className="application-number">
        Application ID: <span id="applicationId">{applicationId}</span>
      </div>
      <p>We have received your application and will review it within 2-3 business days.</p>
      
      <div className="next-steps">
        <h3>What happens next?</h3>
        <ul>
          <li>Our team will review your application and verify all information</li>
          <li>You may receive a call or email if we need additional documentation</li>
          <li>Once approved, you'll receive your merchant account details</li>
          <li>Equipment will be shipped to your business address</li>
        </ul>
      </div>

      {/* Validation status */}
      <div className="validation-status">
        {validationData?.status === 'success' ? (
          <>
            <div style={{ color: '#4CAF50', fontSize: '2rem', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '1.4rem' }}>Validation Successful</h3>
            <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Your application has been validated successfully. All required information has been verified and your application is ready for processing.
            </p>
          </>
        ) : validationData?.status === 'error' ? (
          <>
            <div style={{ color: '#f44336', fontSize: '2rem', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ color: '#f44336', marginBottom: '15px', fontSize: '1.4rem' }}>Validation Issues Found</h3>
            <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Some validation issues were found in your application. Our team will review these issues and contact you if additional information is needed.
            </p>
          </>
        ) : (
          <>
            <div style={{ color: '#ff9800', fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
            <h3 style={{ color: '#ff9800', marginBottom: '15px', fontSize: '1.4rem' }}>Validation in Progress</h3>
            <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Your application is currently being validated. This process may take a few moments. You will receive an email notification once the validation is complete.
            </p>
          </>
        )}
      </div>
      
      <button 
        type="button" 
        className="back-to-form-btn" 
        onClick={onBack}
      >
        ← Back to Form
      </button>
    </div>
  );
};

export default ThankYouMessage;