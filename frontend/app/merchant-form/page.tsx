"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProgressBar from '@/app/components/ProgressBar';
import FormSection from '@/app/components/FormSection';
import ThankYouMessage from '@/app/components/ThankYouMessage';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import PrincipalForm from '../components/PrincipalForm';
import { API_URL } from '../utils/constants';

type Principal = {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  street: string;
  street2: string;
  zipCode: string;
  city: string;
  state: string;
  equityOwnershipPercentage: number;
  title: string;
  isPersonalGuarantor: boolean;
  driverLicenseNumber: string;
  driverLicenseIssuedState: string;
};

type ApplicationData = {
  agent: number;
  applicationName: string;
  externalKey: string;
  plan: {
    planId: number;
    equipmentCostToMerchant: number;
    accountSetupFee: number;
    discountFrequency: string;
    equipment: {
      equipmentId: number;
      quantity: number;
    }[];
  };
  shipping: {
    shippingDestination: string;
    deliveryMethod: string;
  };
  principals: Principal[];
  business: {
    corporateName: string;
    dbaName: string;
    businessType: string;
    federalTaxIdNumber: string;
    federalTaxIdType: string;
    mcc: string;
    phone: string;
    email: string;
    averageTicketAmount: number;
    averageMonthlyVolume: number;
    highTicketAmount: number;
    merchandiseServicesSold: string;
    percentOfBusinessTransactions: {
      cardSwiped: number;
      keyedCardPresentNotImprinted: number;
      mailOrPhoneOrder: number;
      internet: number;
    };
    businessContact: {
      firstName: string;
      lastName: string;
      socialSecurityNumber: string;
      dateOfBirth: string;
      street: string;
      street2: string;
      zipCode: string;
      city: string;
      state: string;
      phoneNumber: string;
      email: string;
    };
    statementDeliveryMethod: string;
    businessAddress: {
      dba: {
        street: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
      };
      corporate: {
        street: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
      };
      shipTo: {
        street: string;
        street2: string;
        city: string;
        state: string;
        zipCode: string;
      };
    };
    websites: {
      url: string;
      websiteCustomerServiceEmail: string;
      websiteCustomerServicePhoneNumber: string;
    }[];
    businessServicesRequested: {
      ebt: {
        ebtType: string;
        ebtAccountNumber: string;
      }[];
    }[];
  };
  bankAccount: {
    abaRouting: string;
    accountType: string;
    demandDepositAccount: string;
  };
};

export default function MerchantApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [showThankYou, setShowThankYou] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [validationData, setValidationData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ApplicationData>>({
    agent: 84152,
    plan: {
      planId: 0,
      equipmentCostToMerchant: 0,
      accountSetupFee: 0,
      discountFrequency: '',
      equipment: [
        {
          equipmentId: 0,
          quantity: 0,
        },
      ],
    },
    shipping: {
      shippingDestination: '',
      deliveryMethod: '',
    },
    principals: [
      {
        firstName: '',
        lastName: '',
        socialSecurityNumber: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
        street: '',
        street2: '',
        zipCode: '',
        city: '',
        state: '',
        equityOwnershipPercentage: 0,
        title: '',
        isPersonalGuarantor: true,
        driverLicenseNumber: '',
        driverLicenseIssuedState: '',
      },
    ],
    business: {
      corporateName: '',
      dbaName: '',
      businessType: '',
      federalTaxIdNumber: '',
      federalTaxIdType: '',
      mcc: '',
      phone: '',
      email: '',
      averageTicketAmount: 0,
      averageMonthlyVolume: 0,
      highTicketAmount: 0,
      merchandiseServicesSold: '',
      percentOfBusinessTransactions: {
        cardSwiped: 0,
        keyedCardPresentNotImprinted: 0,
        mailOrPhoneOrder: 0,
        internet: 0,
      },
      businessContact: {
        firstName: '',
        lastName: '',
        socialSecurityNumber: '',
        dateOfBirth: '',
        street: '',
        street2: '',
        zipCode: '',
        city: '',
        state: '',
        phoneNumber: '',
        email: '',
      },
      statementDeliveryMethod: '',
      businessAddress: {
        dba: {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
        },
        corporate: {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
        },
        shipTo: {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
        }
      },
      websites: [],
      businessServicesRequested: [],
    },
    bankAccount: {
      accountType: 'checking',
      abaRouting: '',
      demandDepositAccount: '',
    },
  });

  const searchParams = useSearchParams();
  // Initialize form with URL parameter
  useEffect(() => {
    const key = searchParams.get('key');
    if (key && typeof key === 'string') {
      setFormData(prev => ({
        ...prev,
        externalKey: key,
      }));
      loadApplicationData(key);
    }
  }, [searchParams]);

  const loadApplicationData = async (externalKey: string) => {
    setLoading(true);
    setLoadingMessage('Loading application data...');

    try {
      const response = await fetch(`${API_URL}/api/application/${externalKey}`);
      const data = await response.json();

      if (response.ok && data) {
        populateFormWithData(data);
        setStatusMessage({
          type: 'success',
          title: 'Application Data Loaded',
          description: 'The application data has been successfully loaded and populated into the form.',
        });
      } else {
        setStatusMessage({
          type: 'warning',
          title: 'No Application Found',
          description: 'No application was found with the provided external key. You can still fill out the form manually.',
        });
      }
    } catch (error) {
      console.error('Error loading application data:', error);
      setStatusMessage({
        type: 'error',
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const populateFormWithData = (data: any) => {
    const applicationData = data.data ? data.data.application : data;
    if (!applicationData) return;

    setFormData(prev => ({
      ...prev,
      agent: applicationData.agent || prev.agent,
      applicationName: applicationData.applicationName || prev.applicationName,
      externalKey: applicationData.externalKey || prev.externalKey,
      plan: {
        ...prev.plan,
        planId: applicationData.plan?.planId || prev.plan?.planId,
        equipmentCostToMerchant: applicationData.plan?.equipmentCostToMerchant || prev.plan?.equipmentCostToMerchant,
        accountSetupFee: applicationData.plan?.accountSetupFee || prev.plan?.accountSetupFee,
        discountFrequency: applicationData.plan?.discountFrequency || prev.plan?.discountFrequency,
        equipment: applicationData.plan?.equipment?.length > 0
          ? applicationData.plan.equipment
          : prev.plan?.equipment || [],
      },
      shipping: {
        shippingDestination: applicationData.shipping?.shippingDestination || prev.shipping?.shippingDestination,
        deliveryMethod: applicationData.shipping?.deliveryMethod || prev.shipping?.deliveryMethod,
      },
      principals: applicationData.principals?.length > 0
        ? applicationData.principals
        : prev.principals || [],
      business: {
        ...prev.business,
        corporateName: applicationData.business?.corporateName || prev.business?.corporateName,
        dbaName: applicationData.business?.dbaName || prev.business?.dbaName,
        businessType: applicationData.business?.businessType || prev.business?.businessType,
        federalTaxIdNumber: applicationData.business?.federalTaxIdNumber || prev.business?.federalTaxIdNumber,
        federalTaxIdType: applicationData.business?.federalTaxIdType || prev.business?.federalTaxIdType,
        mcc: applicationData.business?.mcc || prev.business?.mcc,
        phone: applicationData.business?.phone || prev.business?.phone,
        email: applicationData.business?.email || prev.business?.email,
        averageTicketAmount: applicationData.business?.averageTicketAmount || prev.business?.averageTicketAmount,
        averageMonthlyVolume: applicationData.business?.averageMonthlyVolume || prev.business?.averageMonthlyVolume,
        highTicketAmount: applicationData.business?.highTicketAmount || prev.business?.highTicketAmount,
        merchandiseServicesSold: applicationData.business?.merchandiseServicesSold || prev.business?.merchandiseServicesSold,
        percentOfBusinessTransactions: {
          cardSwiped: applicationData.business?.percentOfBusinessTransactions?.cardSwiped || 0,
          keyedCardPresentNotImprinted: applicationData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted || 0,
          mailOrPhoneOrder: applicationData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder || 0,
          internet: applicationData.business?.percentOfBusinessTransactions?.internet || 0,
        },
        businessContact: {
          firstName: applicationData.business?.businessContact?.firstName || '',
          lastName: applicationData.business?.businessContact?.lastName || '',
          socialSecurityNumber: applicationData.business?.businessContact?.socialSecurityNumber || '',
          dateOfBirth: applicationData.business?.businessContact?.dateOfBirth || '',
          street: applicationData.business?.businessContact?.street || '',
          street2: applicationData.business?.businessContact?.street2 || '',
          zipCode: applicationData.business?.businessContact?.zipCode || '',
          city: applicationData.business?.businessContact?.city || '',
          state: applicationData.business?.businessContact?.state || '',
          phoneNumber: applicationData.business?.businessContact?.phoneNumber || '',
          email: applicationData.business?.businessContact?.email || '',
        },
        statementDeliveryMethod: applicationData.business?.statementDeliveryMethod || prev.business?.statementDeliveryMethod,
        businessAddress: {
          dba: {
            street: applicationData.business?.businessAddress?.dba?.street || '',
            street2: applicationData.business?.businessAddress?.dba?.street2 || '',
            city: applicationData.business?.businessAddress?.dba?.city || '',
            state: applicationData.business?.businessAddress?.dba?.state || '',
            zipCode: applicationData.business?.businessAddress?.dba?.zipCode || '',
          },
          corporate: {
            street: applicationData.business?.businessAddress?.corporate?.street || '',
            street2: applicationData.business?.businessAddress?.corporate?.street2 || '',
            city: applicationData.business?.businessAddress?.corporate?.city || '',
            state: applicationData.business?.businessAddress?.corporate?.state || '',
            zipCode: applicationData.business?.businessAddress?.corporate?.zipCode || '',
          },
          shipTo: {
            street: applicationData.business?.businessAddress?.shipTo?.street || '',
            street2: applicationData.business?.businessAddress?.shipTo?.street2 || '',
            city: applicationData.business?.businessAddress?.shipTo?.city || '',
            state: applicationData.business?.businessAddress?.shipTo?.state || '',
            zipCode: applicationData.business?.businessAddress?.shipTo?.zipCode || '',
          },
        },
        websites: applicationData.business?.websites?.length > 0
          ? applicationData.business.websites
          : prev.business?.websites || [],
        businessServicesRequested: applicationData.business?.businessServicesRequested || prev.business?.businessServicesRequested || [],
      },
      bankAccount: {
        abaRouting: applicationData.bankAccount?.abaRouting || prev.bankAccount?.abaRouting,
        accountType: applicationData.bankAccount?.accountType || prev.bankAccount?.accountType,
        demandDepositAccount: applicationData.bankAccount?.demandDepositAccount || prev.bankAccount?.demandDepositAccount,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown> || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePrincipalChange = (index: number, field: keyof Principal, value: any) => {
    setFormData(prev => {
      const updatedPrincipals = [...(prev.principals || [])];
      updatedPrincipals[index] = {
        ...updatedPrincipals[index],
        [field]: value,
      };
      return {
        ...prev,
        principals: updatedPrincipals,
      };
    });
  };

  const addPrincipal = (data: Partial<Principal> = {}) => {
    setFormData(prev => ({
      ...prev,
      principals: [
        ...(prev.principals || []),
        {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          socialSecurityNumber: data.socialSecurityNumber || '',
          dateOfBirth: data.dateOfBirth || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          street: data.street || '',
          street2: data.street2 || '',
          zipCode: data.zipCode || '',
          city: data.city || '',
          state: data.state || '',
          equityOwnershipPercentage: data.equityOwnershipPercentage || 0,
          title: data.title || '',
          isPersonalGuarantor: data.isPersonalGuarantor || false,
          driverLicenseNumber: data.driverLicenseNumber || '',
          driverLicenseIssuedState: data.driverLicenseIssuedState || '',
        },
      ],
    }));
  };

  const removePrincipal = (index: number) => {
    setFormData(prev => {
      const updatedPrincipals = [...(prev.principals || [])];
      updatedPrincipals.splice(index, 1);
      return {
        ...prev,
        principals: updatedPrincipals,
      };
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setLoadingMessage('Submitting application...');

    try {
      // Submit the application
      const submitResponse = await fetch(`${API_URL}/api/merchant/full-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const submitData = await submitResponse.json();

      if (submitData.status === 'error') {
        setStatusMessage({
          type: 'error',
          title: 'Validation Errors',
          description: 'Some validation errors were found in your application. Please review and correct the issues below.',
        });
        setLoading(false);
        return;
      }

      // If submission successful, call validation API
      setLoadingMessage('Validating application...');

      const externalKey = formData.externalKey;
      const validationResponse = await fetch(
        `${API_URL}/api/application/validate/${encodeURIComponent(externalKey || '')}`
      );
      const validationData = await validationResponse.json();

      // Show thank you message with validation status
      setApplicationId(submitData.applicationId || submitData.id || 'Pending');
      setValidationData(validationData);
      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setStatusMessage({
        type: 'error',
        title: 'Submission Failed',
        description: 'An error occurred while submitting your application. Please check your internet connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const showFormAgain = () => {
    setShowThankYou(false);
    setStatusMessage(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Merchant Application Form</h1>
        <p>Complete merchant and business details for processing</p>
      </div>

      <ProgressBar currentStep={currentStep} />

      {!showThankYou ? (
        <div className="form-content">
          <form id="merchantForm">
            {/* Step 1: General Information */}
            <FormSection
              active={currentStep === 1}
              id="step1"
              title="General Information"
            >
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="agent">Agent ID <span className="required">*</span></label>
                  <input
                    type="number"
                    id="agent"
                    name="agent"
                    value={formData.agent || ''}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="applicationName">Application Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="applicationName"
                    name="applicationName"
                    value={formData.applicationName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="externalKey">External Key <span className="required">*</span></label>
                  <input
                    type="text"
                    id="externalKey"
                    name="externalKey"
                    value={formData.externalKey || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Plan Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="plan.planId">Plan ID <span className="required">*</span></label>
                  <input
                    type="number"
                    id="plan.planId"
                    name="plan.planId"
                    value={formData.plan?.planId || ''}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="plan.equipmentCostToMerchant">Equipment Cost <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    id="plan.equipmentCostToMerchant"
                    name="plan.equipmentCostToMerchant"
                    value={formData.plan?.equipmentCostToMerchant || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="plan.accountSetupFee">Account Setup Fee <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    id="plan.accountSetupFee"
                    name="plan.accountSetupFee"
                    value={formData.plan?.accountSetupFee || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="plan.discountFrequency">Discount Frequency <span className="required">*</span></label>
                  <select
                    id="plan.discountFrequency"
                    name="plan.discountFrequency"
                    value={formData.plan?.discountFrequency || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option className='bg-slate-900' value="">Select Frequency</option>
                    <option className='bg-slate-900' value="Daily">Daily</option>
                    <option className='bg-slate-900' value="Weekly">Weekly</option>
                    <option className='bg-slate-900' value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <h3>Shipping Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="shipping.shippingDestination">Shipping Destination <span className="required">*</span></label>
                  <select
                    id="shipping.shippingDestination"
                    name="shipping.shippingDestination"
                    value={formData.shipping?.shippingDestination || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option className='bg-slate-900' value="">Select Destination</option>
                    <option className='bg-slate-900' value="DBA">DBA Address</option>
                    <option className='bg-slate-900' value="Corporate">Corporate Address</option>
                    <option className='bg-slate-900' value="Other">Other Address</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="shipping.deliveryMethod">Delivery Method <span className="required">*</span></label>
                  <select
                    id="shipping.deliveryMethod"
                    name="shipping.deliveryMethod"
                    value={formData.shipping?.deliveryMethod || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option className='bg-slate-900' value="">Select Method</option>
                    <option className='bg-slate-900' value="Ground">Ground</option>
                  </select>
                </div>
              </div>
            </FormSection>

            {/* Step 2: Business Information */}
            <FormSection
              active={currentStep === 2}
              id="step2"
              title="Business Information"
            >
              <h3>Basic Business Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="business.corporateName">Corporate Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.corporateName"
                    name="business.corporateName"
                    value={formData.business?.corporateName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.dbaName">DBA Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.dbaName"
                    name="business.dbaName"
                    value={formData.business?.dbaName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessType">Business Type <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.businessType"
                    name="business.businessType"
                    value={formData.business?.businessType || ''}
                    onChange={handleInputChange}
                    required
                  />  
                </div>

                <div className="form-group">
                  <label htmlFor="business.federalTaxIdNumber">Federal Tax ID <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.federalTaxIdNumber"
                    name="business.federalTaxIdNumber"
                    value={formData.business?.federalTaxIdNumber || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.federalTaxIdType">Tax ID Type <span className="required">*</span></label>
                  <input
                    type="text" 
                    id="business.federalTaxIdType"
                    name="business.federalTaxIdType"
                    value={formData.business?.federalTaxIdType || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.mcc">MCC Code <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.mcc"
                    name="business.mcc"
                    value={formData.business?.mcc || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.phone">Business Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="business.phone"
                    name="business.phone"
                    value={formData.business?.phone || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.email">Business Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="business.email"
                    name="business.email"
                    value={formData.business?.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Business Volume</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="business.averageTicketAmount">Average Ticket Amount <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    id="business.averageTicketAmount"
                    name="business.averageTicketAmount"
                    value={formData.business?.averageTicketAmount || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.averageMonthlyVolume">Average Monthly Volume <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    id="business.averageMonthlyVolume"
                    name="business.averageMonthlyVolume"
                    value={formData.business?.averageMonthlyVolume || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.highTicketAmount">High Ticket Amount <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    id="business.highTicketAmount"
                    name="business.highTicketAmount"
                    value={formData.business?.highTicketAmount || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Business Transactions</h3>
              <div className="form-group">
                <label>Merchandise/Services Sold <span className="required">*</span></label>
                <textarea
                  id="business.merchandiseServicesSold"
                  name="business.merchandiseServicesSold"
                  className='w-full px-4 border border-gray-300 rounded-md ' 
                  value={formData.business?.merchandiseServicesSold || ''}
                  onChange={(e) => handleInputChange(e as any)}
                  required
                  rows={3}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="business.percentOfBusinessTransactions.cardSwiped">Card Swiped (%) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id="business.percentOfBusinessTransactions.cardSwiped"
                    name="business.percentOfBusinessTransactions.cardSwiped"
                    value={formData.business?.percentOfBusinessTransactions?.cardSwiped || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted">Keyed Card Present (%) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                    name="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                    value={formData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.percentOfBusinessTransactions.mailOrPhoneOrder">Mail/Phone Order (%) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                    name="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                    value={formData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.percentOfBusinessTransactions.internet">Internet (%) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    id="business.percentOfBusinessTransactions.internet"
                    name="business.percentOfBusinessTransactions.internet"
                    value={formData.business?.percentOfBusinessTransactions?.internet || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Business Contact</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="business.businessContact.firstName">First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.businessContact.firstName"
                    name="business.businessContact.firstName"
                    value={formData.business?.businessContact?.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessContact.lastName">Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.businessContact.lastName"
                    name="business.businessContact.lastName"
                    value={formData.business?.businessContact?.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessContact.socialSecurityNumber">SSN <span className="required">*</span></label>
                  <input
                    type="text"
                    id="business.businessContact.socialSecurityNumber"
                    name="business.businessContact.socialSecurityNumber"
                    value={formData.business?.businessContact?.socialSecurityNumber || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessContact.dateOfBirth">Date of Birth <span className="required">*</span></label>
                  <input
                    type="date"
                    id="business.businessContact.dateOfBirth"
                    name="business.businessContact.dateOfBirth"
                    value={formData.business?.businessContact?.dateOfBirth || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessContact.phoneNumber">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="business.businessContact.phoneNumber"
                    name="business.businessContact.phoneNumber"
                    value={formData.business?.businessContact?.phoneNumber || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="business.businessContact.email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="business.businessContact.email"
                    name="business.businessContact.email"
                    value={formData.business?.businessContact?.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Business Addresses</h3>
              <div className="address-section">
                <h4>DBA Address</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business.businessAddress.dba.street">Street <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.dba.street"
                      name="business.businessAddress.dba.street"
                      value={formData.business?.businessAddress?.dba?.street || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.dba.street2">Street 2</label>
                    <input
                      type="text"
                      id="business.businessAddress.dba.street2"
                      name="business.businessAddress.dba.street2"
                      value={formData.business?.businessAddress?.dba?.street2 || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.dba.city">City <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.dba.city"
                      name="business.businessAddress.dba.city"
                      value={formData.business?.businessAddress?.dba?.city || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.dba.state">State <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.dba.state"
                      name="business.businessAddress.dba.state"
                      value={formData.business?.businessAddress?.dba?.state || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.dba.zipCode">Zip Code <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.dba.zipCode"
                      name="business.businessAddress.dba.zipCode"
                      value={formData.business?.businessAddress?.dba?.zipCode || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="address-section">
                <h4>Corporate Address</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business.businessAddress.corporate.street">Street <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.corporate.street"
                      name="business.businessAddress.corporate.street"
                      value={formData.business?.businessAddress?.corporate?.street || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.corporate.street2">Street 2</label>
                    <input
                      type="text"
                      id="business.businessAddress.corporate.street2"
                      name="business.businessAddress.corporate.street2"
                      value={formData.business?.businessAddress?.corporate?.street2 || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.corporate.city">City <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.corporate.city"
                      name="business.businessAddress.corporate.city"
                      value={formData.business?.businessAddress?.corporate?.city || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.corporate.state">State <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.corporate.state"
                      name="business.businessAddress.corporate.state"
                      value={formData.business?.businessAddress?.corporate?.state || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.corporate.zipCode">Zip Code <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.corporate.zipCode"
                      name="business.businessAddress.corporate.zipCode"
                      value={formData.business?.businessAddress?.corporate?.zipCode || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="address-section">
                <h4>Ship To Address</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business.businessAddress.shipTo.street">Street <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.shipTo.street"
                      name="business.businessAddress.shipTo.street"
                      value={formData.business?.businessAddress?.shipTo?.street || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.shipTo.street2">Street 2</label>
                    <input
                      type="text"
                      id="business.businessAddress.shipTo.street2"
                      name="business.businessAddress.shipTo.street2"
                      value={formData.business?.businessAddress?.shipTo?.street2 || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.shipTo.city">City <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.shipTo.city"
                      name="business.businessAddress.shipTo.city"
                      value={formData.business?.businessAddress?.shipTo?.city || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.shipTo.state">State <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.shipTo.state"
                      name="business.businessAddress.shipTo.state"
                      value={formData.business?.businessAddress?.shipTo?.state || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessAddress.shipTo.zipCode">Zip Code <span className="required">*</span></label>
                    <input
                      type="text"
                      id="business.businessAddress.shipTo.zipCode"
                      name="business.businessAddress.shipTo.zipCode"
                      value={formData.business?.businessAddress?.shipTo?.zipCode || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <h3>Bank Account Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bankAccount.abaRouting">ABA Routing Number <span className="required">*</span></label>
                  <input
                    type="text"
                    id="bankAccount.abaRouting"
                    name="bankAccount.abaRouting"
                    value={formData.bankAccount?.abaRouting || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankAccount.accountType">Account Type <span className="required">*</span></label>
                  <select
                    id="bankAccount.accountType"
                    name="bankAccount.accountType"
                    value={formData.bankAccount?.accountType || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bankAccount.demandDepositAccount">Account Number <span className="required">*</span></label>
                  <input
                    type="text"
                    id="bankAccount.demandDepositAccount"
                    name="bankAccount.demandDepositAccount"
                    value={formData.bankAccount?.demandDepositAccount || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </FormSection>


            {/* Step 3: Principals & Additional Details */}
            <FormSection
              active={currentStep === 3}
              id="step3"
              title="Principals & Additional Details"
            >
              <h3>Principals</h3>
              {formData.principals?.map((principal, index) => (
                <div key={index} className="principal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor={`principals[${index}].firstName`}>First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].firstName`}
                        name={`principals[${index}].firstName`}
                        value={principal.firstName || ''}
                        onChange={(e) => handlePrincipalChange(index, 'firstName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].lastName`}>Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].lastName`}
                        name={`principals[${index}].lastName`}
                        value={principal.lastName || ''}
                        onChange={(e) => handlePrincipalChange(index, 'lastName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].socialSecurityNumber`}>SSN <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].socialSecurityNumber`}
                        name={`principals[${index}].socialSecurityNumber`}
                        value={principal.socialSecurityNumber || ''}
                        onChange={(e) => handlePrincipalChange(index, 'socialSecurityNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].dateOfBirth`}>Date of Birth <span className="required">*</span></label>
                      <input
                        type="date"
                        id={`principals[${index}].dateOfBirth`}
                        name={`principals[${index}].dateOfBirth`}
                        value={principal.dateOfBirth || ''}
                        onChange={(e) => handlePrincipalChange(index, 'dateOfBirth', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].phoneNumber`}>Phone Number <span className="required">*</span></label>
                      <input
                        type="tel"
                        id={`principals[${index}].phoneNumber`}
                        name={`principals[${index}].phoneNumber`}
                        value={principal.phoneNumber || ''}
                        onChange={(e) => handlePrincipalChange(index, 'phoneNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].email`}>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        id={`principals[${index}].email`}
                        name={`principals[${index}].email`}
                        value={principal.email || ''}
                        onChange={(e) => handlePrincipalChange(index, 'email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].street`}>Street <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].street`}
                        name={`principals[${index}].street`}
                        value={principal.street || ''}
                        onChange={(e) => handlePrincipalChange(index, 'street', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].street2`}>Street 2</label>
                      <input
                        type="text"
                        id={`principals[${index}].street2`}
                        name={`principals[${index}].street2`}
                        value={principal.street2 || ''}
                        onChange={(e) => handlePrincipalChange(index, 'street2', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].city`}>City <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].city`}
                        name={`principals[${index}].city`}
                        value={principal.city || ''}
                        onChange={(e) => handlePrincipalChange(index, 'city', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].state`}>State <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].state`}
                        name={`principals[${index}].state`}
                        value={principal.state || ''}
                        onChange={(e) => handlePrincipalChange(index, 'state', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].zipCode`}>Zip Code <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].zipCode`}
                        name={`principals[${index}].zipCode`}
                        value={principal.zipCode || ''}
                        onChange={(e) => handlePrincipalChange(index, 'zipCode', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].equityOwnershipPercentage`}>Ownership % <span className="required">*</span></label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        id={`principals[${index}].equityOwnershipPercentage`}
                        name={`principals[${index}].equityOwnershipPercentage`}
                        value={principal.equityOwnershipPercentage || ''}
                        onChange={(e) => handlePrincipalChange(index, 'equityOwnershipPercentage', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].title`}>Title <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].title`}
                        name={`principals[${index}].title`}
                        value={principal.title || ''}
                        onChange={(e) => handlePrincipalChange(index, 'title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].driverLicenseNumber`}>Driver License # <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].driverLicenseNumber`}
                        name={`principals[${index}].driverLicenseNumber`}
                        value={principal.driverLicenseNumber || ''}
                        onChange={(e) => handlePrincipalChange(index, 'driverLicenseNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`principals[${index}].driverLicenseIssuedState`}>License State <span className="required">*</span></label>
                      <input
                        type="text"
                        id={`principals[${index}].driverLicenseIssuedState`}
                        name={`principals[${index}].driverLicenseIssuedState`}
                        value={principal.driverLicenseIssuedState || ''}
                        onChange={(e) => handlePrincipalChange(index, 'driverLicenseIssuedState', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id={`principals[${index}].isPersonalGuarantor`}
                        name={`principals[${index}].isPersonalGuarantor`}
                        checked={principal.isPersonalGuarantor || false}
                        onChange={(e) => handlePrincipalChange(index, 'isPersonalGuarantor', e.target.checked)}
                      />
                      <label htmlFor={`principals[${index}].isPersonalGuarantor`}>Personal Guarantor</label>
                    </div>
                  </div>

                  {formData.principals && formData.principals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrincipal(index)}
                      className="btn-danger"
                    >
                      Remove Principal
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addPrincipal()}
                className="btn-info"
              >
                ➕ Add Principal
              </button>

              <h3>Website Information</h3>
              <div className="website-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business.websites[0].url">Website URL <span className="required">*</span></label>
                    <input
                      type="url"
                      id="business.websites[0].url"
                      name="business.websites[0].url"
                      value={formData.business?.websites?.[0]?.url || ''}
                      onChange={(e) => {
                        const updatedWebsites = [...(formData.business?.websites || [])];
                        if (updatedWebsites.length === 0) {
                          updatedWebsites.push({
                            url: '',
                            websiteCustomerServiceEmail: '',
                            websiteCustomerServicePhoneNumber: ''
                          });
                        }
                        updatedWebsites[0].url = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            websites: updatedWebsites
                          }
                        }));
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.websites[0].websiteCustomerServiceEmail">Customer Service Email</label>
                    <input
                      type="email"
                      id="business.websites[0].websiteCustomerServiceEmail"
                      name="business.websites[0].websiteCustomerServiceEmail"
                      value={formData.business?.websites?.[0]?.websiteCustomerServiceEmail || ''}
                      onChange={(e) => {
                        const updatedWebsites = [...(formData.business?.websites || [])];
                        if (updatedWebsites.length === 0) {
                          updatedWebsites.push({
                            url: '',
                            websiteCustomerServiceEmail: '',
                            websiteCustomerServicePhoneNumber: ''
                          });
                        }
                        updatedWebsites[0].websiteCustomerServiceEmail = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            websites: updatedWebsites
                          }
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.websites[0].websiteCustomerServicePhoneNumber">Customer Service Phone</label>
                    <input
                      type="tel"
                      id="business.websites[0].websiteCustomerServicePhoneNumber"
                      name="business.websites[0].websiteCustomerServicePhoneNumber"
                      value={formData.business?.websites?.[0]?.websiteCustomerServicePhoneNumber || ''}
                      onChange={(e) => {
                        const updatedWebsites = [...(formData.business?.websites || [])];
                        if (updatedWebsites.length === 0) {
                          updatedWebsites.push({
                            url: '',
                            websiteCustomerServiceEmail: '',
                            websiteCustomerServicePhoneNumber: ''
                          });
                        }
                        updatedWebsites[0].websiteCustomerServicePhoneNumber = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            websites: updatedWebsites
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <h3>EBT Information</h3>
              <div className="ebt-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business.businessServicesRequested[0].ebt[0].ebtType">EBT Type <span className="required">*</span></label>
                    <select
                      id="business.businessServicesRequested[0].ebt[0].ebtType"
                      name="business.businessServicesRequested[0].ebt[0].ebtType"
                      value={formData.business?.businessServicesRequested?.[0]?.ebt?.[0]?.ebtType || ''}
                      onChange={(e) => {
                        const updatedServices = [...(formData.business?.businessServicesRequested || [])];
                        if (updatedServices.length === 0) {
                          updatedServices.push({ ebt: [{ ebtType: '', ebtAccountNumber: '' }] });
                        } else if (!updatedServices[0].ebt || updatedServices[0].ebt.length === 0) {
                          updatedServices[0].ebt = [{ ebtType: '', ebtAccountNumber: '' }];
                        }
                        updatedServices[0].ebt[0].ebtType = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            businessServicesRequested: updatedServices
                          }
                        }));
                      }}
                      required
                    >
                      <option value="">Select EBT Type</option>
                      <option value="SNAP">SNAP</option>
                      <option value="TANF">TANF</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="business.businessServicesRequested[0].ebt[0].ebtAccountNumber">EBT Account Number</label>
                    <input
                      type="text"
                      id="business.businessServicesRequested[0].ebt[0].ebtAccountNumber"
                      name="business.businessServicesRequested[0].ebt[0].ebtAccountNumber"
                      value={formData.business?.businessServicesRequested?.[0]?.ebt?.[0]?.ebtAccountNumber || ''}
                      onChange={(e) => {
                        const updatedServices = [...(formData.business?.businessServicesRequested || [])];
                        if (updatedServices.length === 0) {
                          updatedServices.push({ ebt: [{ ebtType: '', ebtAccountNumber: '' }] });
                        } else if (!updatedServices[0].ebt || updatedServices[0].ebt.length === 0) {
                          updatedServices[0].ebt = [{ ebtType: '', ebtAccountNumber: '' }];
                        }
                        updatedServices[0].ebt[0].ebtAccountNumber = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            businessServicesRequested: updatedServices
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          </form>
        </div>
      ) : (
        <ThankYouMessage
          applicationId={applicationId}
          validationData={validationData}
          onBack={showFormAgain}
        />
      )}

      {!showThankYou && (
        <div className="navigation-buttons">
          <button
            type="button"
            className="nav-btn"
            onClick={previousStep}
            disabled={currentStep === 1}
          >
            ← Previous
          </button>
          {currentStep < 3 ? (
            <button
              type="button"
              className="nav-btn"
              onClick={nextStep}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="nav-btn"
              onClick={submitForm}
            >
              Submit Application
            </button>
          )}
        </div>
      )}

      <LoadingOverlay
        visible={loading}
        message={loadingMessage}
      />

      {/* Status message */}
      {statusMessage && (
        <div className={`status ${statusMessage.type}`}>
          <div className="status-icon">
            {statusMessage.type === 'success' && '✅'}
            {statusMessage.type === 'error' && '❌'}
            {statusMessage.type === 'warning' && '⚠️'}
            {statusMessage.type === 'info' && 'ℹ️'}
          </div>
          <div className="status-title">{statusMessage.title}</div>
          <div className="status-description">{statusMessage.description}</div>
        </div>
      )}
    </div>
  );
}