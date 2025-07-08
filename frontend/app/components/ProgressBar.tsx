import React from 'react';

type ProgressBarProps = {
  currentStep: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="progress-bar">
      {[1, 2, 3].map(step => (
        <div 
          key={step}
          className={`progress-step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
          data-step={step}
        >
          {step}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;