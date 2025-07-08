import React from 'react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-10/12 mx-auto">
        <header className="bg-gray-900 text-center p-8 rounded-t-xl border-b border-gray-800">
          <h1 className="text-3xl font-light mb-2">Merchant Onboarding Dashboard</h1>
          <p className="text-gray-400">Create applications and track their status</p>
        </header>
        
        <main className="bg-gray-900 rounded-b-xl p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;