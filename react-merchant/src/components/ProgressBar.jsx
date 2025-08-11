const ProgressBar = ({ currentStep, totalSteps }) => {
return (
    <div className="flex justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div 
          key={i + 1}
          className={`w-10 h-10 rounded-full flex items-center justify-center 
            ${currentStep === i + 1 ? 
              'bg-blue-600 text-white dark:bg-blue-500' : 
              'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
            transition-colors duration-200`}
          data-step={i + 1}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
