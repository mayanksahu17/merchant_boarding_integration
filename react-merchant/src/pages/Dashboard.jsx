import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createApplication,
  generateMerchantLink,
  sendMerchantLinkEmail,
  submitApplication,
  refreshApplications,
  deleteApplication
} from '../services/api';
import CreateApplicationForm from '../components/CreateApplicationForm';
import GenerateLinkSection from '../components/GenerateLinkSection';
import RecentApplications from '../components/RecentApplications';
import LoadingOverlay from '../components/LoadingOverlay';
import StatusDisplay from '../components/StatusDisplay';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [externalKey, setExternalKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [merchantLink, setMerchantLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authExpiry');

    if (!token || !expiry || new Date().getTime() > Number(expiry)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authExpiry');
      navigate('/login');
      return;
    }

    // Generate initial external key
    setExternalKey("EXT" + Math.floor(Math.random() * 1e14));

    // Load applications
    loadApplications();
  }, [navigate]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await refreshApplications();
      setApplications(data);
    } catch (error) {
      setStatus({ message: error.message || 'Failed to load applications', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApplication = async (formData) => {
    setIsLoading(true);
    try {
      const newApp = await createApplication({
        agent: 84152,
        applicationName: formData.applicationName,
        externalKey: formData.externalKey,
        email: formData.email,
        plan: {
          planId: parseInt(formData.planId),
        // },
          equipmentCostToMerchant: 325.49,
          accountSetupFee: 12.95,
          discountFrequency: "Daily",
        },
        shipping: {
          shippingDestination: "DBA",
          deliveryMethod: "Ground"
        },
        principals: [
          {
            firstName: "Jane",
            lastName: "Jackson",
            socialSecurityNumber: "745392845",
            dateOfBirth: "1955-12-25",
            phoneNumber: "1234567890",
            email: "example@email.com",
            street: "123 Selah Way",
            street2: "Suite 123",
            zipCode: "12345",
            city: "South Burlington",
            state: "VT",
            equityOwnershipPercentage: 80,
            title: "ceo",
            isPersonalGuarantor: true,
            driverLicenseNumber: "ABC1234567890",
            driverLicenseIssuedState: "MI"
          },
          {
            firstName: "Jeremy",
            lastName: "Coelman",
            socialSecurityNumber: "678901234",
            dateOfBirth: "1955-12-25",
            phoneNumber: "1234567890",
            email: "example@email.com",
            street: "1234 Finwood Drive",
            zipCode: "12345",
            city: "Red Bank",
            state: "NJ",
            equityOwnershipPercentage: 20,
            title: "manager",
            isPersonalGuarantor: false,
            driverLicenseNumber: null,
            driverLicenseIssuedState: null
          }
        ],
        business: {
          corporateName: "Joe's Spaceage Stereo",
          dbaName: "Jo Jackson Spaceage Stereo",
          businessType: "C",
          federalTaxIdNumber: "123456789",
          federalTaxIdType: "EIN",
          mcc: "5812",
          phone: "1234567890",
          email: "example@email.com",
          ebt: null,
          websites: [
            {
              url: "https://example.com",
              websiteCustomerServiceEmail: "customer-service-email@example.com",
              websiteCustomerServicePhoneNumber: "1234567890"
            }
          ],
          averageTicketAmount: 5000,
          averageMonthlyVolume: 1250000,
          highTicketAmount: 125000,
          merchandiseServicesSold: "Audio components and services",
          percentOfBusinessTransactions: {
            cardSwiped: 65,
            keyedCardPresentNotImprinted: 20,
            mailOrPhoneOrder: 0,
            internet: 15
          },
          businessContact: {
            firstName: "Roy",
            lastName: "Martin",
            socialSecurityNumber: "987654321",
            dateOfBirth: "1947-11-05",
            street: "123 Late Avenue",
            street2: "",
            zipCode: "12345",
            city: "South Burington",
            state: "VT",
            phoneNumber: "1234567890",
            email: "example@email.com"
          },
          statementDeliveryMethod: "electronic",
          businessAddress: {
            dba: {
              street: "1234 Clinton St",
              city: "South Burlington",
              state: "VT",
              zipCode: "12345"
            },
            corporate: {
              street: "1234 Sun Valley Rd",
              city: "South Burlington",
              state: "VT",
              zipCode: "12345"
            },
            shipTo: {
              street: "1234 Saint James Drive",
              city: "South Burlington",
              state: "VT",
              zipCode: "12345"
            }
          },
          businessServicesRequested: [
            {
              ebt: [
                {
                  ebtType: "food",
                  ebtAccountNumber: "987654321"
                }
              ]
            }
          ]
        },
        bankAccount: {
          abaRouting: formData.abaRouting,
          accountType: "checking",
          demandDepositAccount: "123456789"
        }
      });

      // Add to local state
      setApplications(prev => [newApp, ...prev]);

      // Show success message
      setStatus({ message: 'Application created successfully!', type: 'success' });

      // Generate new external key
      setExternalKey("EXT" + Math.floor(Math.random() * 1e14));

      // Clear merchant link if any
      setMerchantLink('');
    } catch (error) {
      setStatus({ message: error.message || 'Failed to create application', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMerchantLink = async (externalKey) => {
    setIsLoading(true);
    try {
      const { link } = await generateMerchantLink(externalKey);
      setMerchantLink(link);
      setStatus({ message: 'Merchant link generated!', type: 'success' });
      return link;
    } catch (error) {
      setStatus({ message: error.message || 'Failed to generate link', type: 'error' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMerchantLinkEmail = async (email, externalKey) => {
    setIsLoading(true);
    try {
      await sendMerchantLinkEmail(email, externalKey);
      setStatus({ message: 'Merchant link sent successfully!', type: 'success' });
    } catch (error) {
      setStatus({ message: error.message || 'Failed to send email', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitApplication = async (externalKey) => {
    if (!window.confirm(`Are you sure you want to submit application ${externalKey} to underwriting?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedApp = await submitApplication(externalKey);

      // Update local state
      setApplications(prev => prev.map(app =>
        app.externalKey === externalKey ? updatedApp : app
      ));

      setStatus({
        message: `Application ${externalKey} submitted to underwriting successfully!`,
        type: 'success'
      });
    } catch (error) {
      setStatus({ message: error.message || 'Failed to submit application', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async (externalKey) => {
    if (!window.confirm(`Are you sure you want to delete application ${externalKey}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteApplication(externalKey);

      // Update local state
      setApplications(prev => prev.filter(app => app.externalKey !== externalKey));

      setStatus({
        message: 'Application deleted successfully!',
        type: 'success'
      });
    } catch (error) {
      setStatus({ message: error.message || 'Failed to delete application', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (externalKey) => {
    const merchantUrl = `${window.location.origin}/merchant-form?key=${encodeURIComponent(externalKey)}`;
    window.open(merchantUrl, '_blank');
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus({ message: 'Copied to clipboard!', type: 'success' });
    }).catch(() => {
      setStatus({ message: 'Failed to copy', type: 'error' });
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-11/12 mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Merchant Onboarding Dashboard</h1>
          <p className="text-gray-400">Create applications and track their status</p>
        </header>

        <StatusDisplay message={status.message} type={status.type} onClose={() => setStatus({ message: '', type: '' })} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CreateApplicationForm
            onSubmit={handleCreateApplication}
            externalKey={externalKey}
            setExternalKey={setExternalKey}
            onCopyKey={() => handleCopyToClipboard(externalKey)}
          />

          <GenerateLinkSection
            applications={applications}
            merchantLink={merchantLink}
            onGenerateLink={handleGenerateMerchantLink}
            onSendEmail={handleSendMerchantLinkEmail}
            onCopyLink={() => handleCopyToClipboard(merchantLink)}
          />
        </div>

        <RecentApplications
          applications={applications}
          onRefresh={loadApplications}
          onSubmit={handleSubmitApplication}
          onDelete={handleDeleteApplication}
          onView={handleViewApplication}
          onGenerateLink={handleGenerateMerchantLink}
        />

        <LoadingOverlay isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;