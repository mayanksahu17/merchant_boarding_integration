"use client";
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import ApplicationForm from '@/app/components/ApplicationForm';
import LinkGenerator from '@/app/components/LinkGenerator';
import ApplicationCard from '@/app/components/ApplicationCard';
import StatusBanner from '@/app/components/StatusBanner';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import AuthOverlay from '@/app/components/AuthOverlay';
import useApplications  from '@/app/hooks/useApplications';
import useAuth from '@/app/hooks/useAuth';
import { APPLICATION_STATUSES } from '@/app/utils/constants';

const DashboardPage = () => {
  const { isAuthenticated, login } = useAuth();
  const {
    applications,
    createApplication,
    submitApplication,
    refreshApplications,
    deleteApplication,
    loading,
    status,
    setStatus
  } = useApplications();

  const [selectedAppForLink, setSelectedAppForLink] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <AuthOverlay onLogin={login} />;
  }

  return (
    <DashboardLayout>
      <LoadingOverlay visible={loading} />
      <StatusBanner status={status} onDismiss={() => setStatus(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ApplicationForm onCreate={createApplication} />
        <LinkGenerator 
          onGenerateLink={setSelectedAppForLink} 
          selectedKey={selectedAppForLink}
        />
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="w-1 h-6 bg-white rounded-full"></span>
            Recent Applications
          </h2>
          <button 
            onClick={refreshApplications}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {applications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <h3 className="text-lg mb-2">No applications yet</h3>
              <p>Create your first application to see it here</p>
            </div>
          ) : (
            applications.map((app, index) => (
              <ApplicationCard
                key={app.externalKey}
                application={app}
                onView={() => window.open(`/merchant-form?key=${app.externalKey}`, '_blank')}
                onSubmit={() => submitApplication(app.externalKey, index)}
                onDelete={() => deleteApplication(index)}
                onGenerateLink={() => setSelectedAppForLink(app.externalKey)}
                showSubmit={app.status === APPLICATION_STATUSES.PENDING || app.status === APPLICATION_STATUSES.VALIDATED}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;