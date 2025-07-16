const LoadingOverlay = ({ isLoading, message = 'Processing...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-white text-lg font-medium mb-2">Please wait</h3>
          <p className="text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;