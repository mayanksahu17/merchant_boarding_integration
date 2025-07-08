import { useState } from 'react';
import { Application } from '../types/types';
import { API_URL, APPLICATION_STATUSES, EMAIL_TYPES } from '../utils/constants';

const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('applications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const createApplication = async (payload: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        const newApp: Application = {
          ...payload,
          status: APPLICATION_STATUSES.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailsSent: {
            [EMAIL_TYPES.WELCOME]: false,
            [EMAIL_TYPES.MERCHANT_LINK]: false,
            [EMAIL_TYPES.STATUS_UPDATE]: false,
            [EMAIL_TYPES.REMINDER]: false,
            [EMAIL_TYPES.SUBMISSION_CONFIRMATION]: false
          },
          emailHistory: []
        };

        setApplications(prev => [newApp, ...prev]);
        localStorage.setItem('applications', JSON.stringify([newApp, ...applications]));
        setStatus({ message: "Application created successfully!", type: "success" });
        return newApp;
      } else {
        throw new Error(data.error || "Failed to create application");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus({ message: errorMessage, type: "error" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (externalKey: string, index: number) => {
    if (!confirm(`Are you sure you want to submit application ${externalKey} to underwriting?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/application/submit/${externalKey}`, {
        method: "POST"
      });

      if (response.ok) {
        const updatedApps = [...applications];
        updatedApps[index] = {
          ...updatedApps[index],
          status: APPLICATION_STATUSES.SUBMITTED,
          updatedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        };

        // Send submission confirmation email
        if (updatedApps[index].email) {
          try {
            await fetch(`${API_URL}/api/send-submission-confirmation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: updatedApps[index].email,
                applicationName: updatedApps[index].applicationName,
                externalKey
              })
            });

            updatedApps[index].emailsSent[EMAIL_TYPES.SUBMISSION_CONFIRMATION] = true;
            updatedApps[index].emailHistory.push({
              type: EMAIL_TYPES.SUBMISSION_CONFIRMATION,
              sentAt: new Date().toISOString(),
              recipient: updatedApps[index].email,
              success: true
            });
          } catch (emailError) {
            console.error('Email error:', emailError);
            updatedApps[index].emailHistory.push({
              type: EMAIL_TYPES.SUBMISSION_CONFIRMATION,
              sentAt: new Date().toISOString(),
              recipient: updatedApps[index].email,
              success: false,
              error: emailError instanceof Error ? emailError.message : 'Unknown error occurred'
            });
          }
        }

        setApplications(updatedApps);
        localStorage.setItem('applications', JSON.stringify(updatedApps));
        setStatus({ message: `Application ${externalKey} submitted successfully!`, type: "success" });
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const refreshApplications = async () => {
    setLoading(true);
    try {
      // Simulate API calls to validate each application
      const updatedApps = await Promise.all(applications.map(async app => {
        try {
          const response = await fetch(`${API_URL}/api/application/validate/${encodeURIComponent(app.externalKey)}`);
          const data = await response.json();
          
          const previousStatus = app.status;
          let newStatus = app.status;
          
          if (data.status === 'success') {
            newStatus = APPLICATION_STATUSES.VALIDATED;
          } else if (data.status === 'error') {
            newStatus = APPLICATION_STATUSES.ERROR;
          }
          
          // Only update if status changed
          if (previousStatus !== newStatus) {
            return { ...app, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return app;
        } catch (error) {
          console.error('Validation error:', error);
          return app;
        }
      }));

      setApplications(updatedApps);
      localStorage.setItem('applications', JSON.stringify(updatedApps));
      setStatus({ message: "Applications refreshed!", type: "success" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = (index: number) => {
    if (confirm('Are you sure you want to delete this application?')) {
      const updatedApps = [...applications];
      updatedApps.splice(index, 1);
      setApplications(updatedApps);
      localStorage.setItem('applications', JSON.stringify(updatedApps));
      setStatus({ message: "Application deleted successfully!", type: "success" });
    }
  };

  return {
    applications,
    createApplication,
    submitApplication,
    refreshApplications,
    deleteApplication,
    loading,
    status,
    setStatus
  };
};

export default useApplications;