"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProgressBar from '@/app/components/ProgressBar';
import FormSection from '@/app/components/FormSection';
import ThankYouMessage from '@/app/components/ThankYouMessage';
import LoadingOverlay from '@/app/components/LoadingOverlay';
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
    const applicationData = data.data?.application;
    if (!applicationData) return;

    setFormData(prev => ({
      ...prev,
      agent: applicationData.agent || prev.agent,
      applicationName: applicationData.applicationName || '',
      externalKey: applicationData.externalKey || '',
      plan: {
        planId: applicationData.plan?.planId || 0,
        equipmentCostToMerchant: applicationData.plan?.equipmentCostToMerchant || 0,
        accountSetupFee: applicationData.plan?.accountSetupFee || 0,
        discountFrequency: applicationData.plan?.discountFrequency || '',
        equipment: applicationData.plan?.equipment || [{
          equipmentId: 0,
          quantity: 0
        }]
      },
      shipping: {
        shippingDestination: applicationData.shipping?.shippingDestination || '',
        deliveryMethod: applicationData.shipping?.deliveryMethod || '',
      },
      principals: applicationData.principals || [],
      business: {
        corporateName: applicationData.business?.corporateName || '',
        dbaName: applicationData.business?.dbaName || '',
        businessType: applicationData.business?.businessType || '',
        federalTaxIdNumber: applicationData.business?.federalTaxIdNumber || '',
        federalTaxIdType: applicationData.business?.federalTaxIdType || '',
        mcc: applicationData.business?.mcc || '',
        phone: applicationData.business?.phone || '',
        email: applicationData.business?.email || '',
        averageTicketAmount: applicationData.business?.averageTicketAmount || 0,
        averageMonthlyVolume: applicationData.business?.averageMonthlyVolume || 0,
        highTicketAmount: applicationData.business?.highTicketAmount || 0,
        merchandiseServicesSold: applicationData.business?.merchandiseServicesSold || '',
        percentOfBusinessTransactions: applicationData.business?.percentOfBusinessTransactions || {
          cardSwiped: 0,
          keyedCardPresentNotImprinted: 0,
          mailOrPhoneOrder: 0,
          internet: 0,
        },
        businessContact: applicationData.business?.businessContact || {
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
        statementDeliveryMethod: applicationData.business?.statementDeliveryMethod || 'electronic',
        businessAddress: applicationData.business?.businessAddress || {
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
        websites: applicationData.business?.websites || [],
        businessServicesRequested: applicationData.business?.businessServicesRequested || [],
      },
      bankAccount: applicationData.bankAccount || {
        accountType: 'checking',
        abaRouting: '',
        demandDepositAccount: '',
      },
    }));

    // Show success message
    setStatusMessage({
      type: 'success',
      title: 'Application Data Loaded',
      description: 'The application data has been successfully loaded and populated into the form.',
    });
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
        <h1>Merchant Full Application Form</h1>
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
                  <label htmlFor="agent">Agent <span className="required">*</span></label>
                  <input
                    type="number"
                    id="agent"
                    name="agent"
                    value={formData.agent || ''}
                    readOnly
                    required
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
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="planId">Plan ID <span className="required">*</span></label>
                  <input
                    type="number"
                    id="planId"
                    name="plan.planId"
                    value={formData.plan?.planId || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="equipmentCostToMerchant">Equipment Cost</label>
                  <input
                    type="number"
                    id="equipmentCostToMerchant"
                    name="plan.equipmentCostToMerchant"
                    value={formData.plan?.equipmentCostToMerchant || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="accountSetupFee">Setup Fee</label>
                  <input
                    type="number"
                    id="accountSetupFee"
                    name="plan.accountSetupFee"
                    value={formData.plan?.accountSetupFee || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discountFrequency">Discount Frequency</label>
                  <input
                    type="text"
                    id="discountFrequency"
                    name="plan.discountFrequency"
                    value={formData.plan?.discountFrequency || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">Equipment</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="equipmentId">Equipment ID</label>
                    <input
                      type="number"
                      id="equipmentId"
                      name="plan.equipment[0].equipmentId"
                      value={formData.plan?.equipment?.[0]?.equipmentId || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="equipmentQuantity">Quantity</label>
                    <input
                      type="number"
                      id="equipmentQuantity"
                      name="plan.equipment[0].quantity"
                      value={formData.plan?.equipment?.[0]?.quantity || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="shippingDestination">Shipping Destination</label>
                  <input
                    type="text"
                    id="shippingDestination"
                    name="shipping.shippingDestination"
                    value={formData.shipping?.shippingDestination || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryMethod">Delivery Method</label>
                  <input
                    type="text"
                    id="deliveryMethod"
                    name="shipping.deliveryMethod"
                    value={formData.shipping?.deliveryMethod || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </FormSection>

            {/* Step 2: Business Information */}
            <FormSection
              active={currentStep === 2}
              id="step2"
              title="Business Information"
            >
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="corporateName">Corporate Name</label>
                  <input
                    type="text"
                    id="corporateName"
                    name="business.corporateName"
                    value={formData.business?.corporateName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dbaName">DBA Name</label>
                  <input
                    type="text"
                    id="dbaName"
                    name="business.dbaName"
                    value={formData.business?.dbaName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessType">Business Type</label>
                  <input
                    type="text"
                    id="businessType"
                    name="business.businessType"
                    value={formData.business?.businessType || ''}
                    onChange={handleInputChange}
                  />  
                </div>

                <div className="form-group">
                  <label htmlFor="federalTaxIdNumber">Federal Tax ID</label>
                  <input
                    type="text"
                    id="federalTaxIdNumber"
                    name="business.federalTaxIdNumber"
                    value={formData.business?.federalTaxIdNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="federalTaxIdType">Tax ID Type</label>
                  <input
                    type="text" 
                    id="federalTaxIdType"
                    name="business.federalTaxIdType"
                    value={formData.business?.federalTaxIdType || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mcc">MCC</label>
                  <input
                    type="text"
                    id="mcc"
                    name="business.mcc"
                    value={formData.business?.mcc || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="businessPhone">Phone</label>
                  <input
                    type="text"
                    id="businessPhone"
                    name="business.phone"
                    value={formData.business?.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessEmail">Email</label>
                  <input
                    type="email"
                    id="businessEmail"
                    name="business.email"
                    value={formData.business?.email || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="averageTicketAmount">Avg Ticket Amount</label>
                  <input
                    type="number"
                    id="averageTicketAmount"
                    name="business.averageTicketAmount"
                    value={formData.business?.averageTicketAmount || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="averageMonthlyVolume">Avg Monthly Volume</label>
                  <input
                    type="number"
                    id="averageMonthlyVolume"
                    name="business.averageMonthlyVolume"
                    value={formData.business?.averageMonthlyVolume || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="highTicketAmount">High Ticket Amount</label>
                  <input
                    type="number"
                    id="highTicketAmount"
                    name="business.highTicketAmount"
                    value={formData.business?.highTicketAmount || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="merchandiseServicesSold">Merchandise/Services</label>
                  <input
                    type="text"
                    id="merchandiseServicesSold"
                    name="business.merchandiseServicesSold"
                    value={formData.business?.merchandiseServicesSold || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">Business Transaction Percentages</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="cardSwiped">Card Swiped (%)</label>
                    <input
                      type="number"
                      id="cardSwiped"
                      name="business.percentOfBusinessTransactions.cardSwiped"
                      value={formData.business?.percentOfBusinessTransactions?.cardSwiped || ''}
                      onChange={handleInputChange}
                      placeholder="%"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="keyedCardPresentNotImprinted">Keyed Card Present (%)</label>
                    <input
                      type="number"
                      id="keyedCardPresentNotImprinted"
                      name="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                      value={formData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted || ''}
                      onChange={handleInputChange}
                      placeholder="%"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mailOrPhoneOrder">Mail/Phone Order (%)</label>
                    <input
                      type="number"
                      id="mailOrPhoneOrder"
                      name="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                      value={formData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder || ''}
                      onChange={handleInputChange}
                      placeholder="%"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="internet">Internet (%)</label>
                    <input
                      type="number"
                      id="internet"
                      name="business.percentOfBusinessTransactions.internet"
                      value={formData.business?.percentOfBusinessTransactions?.internet || ''}
                      onChange={handleInputChange}
                      placeholder="%"
                    />
                  </div>
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">Business Contact</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contactFirstName">First Name</label>
                    <input
                      type="text"
                      id="contactFirstName"
                      name="business.businessContact.firstName"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactLastName">Last Name</label>
                    <input
                      type="text"
                      id="contactLastName"
                      name="business.businessContact.lastName"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactSSN">SSN</label>
                    <input
                      type="text"
                      id="contactSSN"
                      name="business.businessContact.socialSecurityNumber"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactDOB">Date of Birth</label>
                    <input
                      type="date"
                      id="contactDOB"
                      name="business.businessContact.dateOfBirth"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contactStreet">Street</label>
                    <input
                      type="text"
                      id="contactStreet"
                      name="business.businessContact.street"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactStreet2">Street 2</label>
                    <input
                      type="text"
                      id="contactStreet2"
                      name="business.businessContact.street2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactZipCode">Zip Code</label>
                    <input
                      type="text"
                      id="contactZipCode"
                      name="business.businessContact.zipCode"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactCity">City</label>
                    <input
                      type="text"
                      id="contactCity"
                      name="business.businessContact.city"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactState">State</label>
                    <input
                      type="text"
                      id="contactState"
                      name="business.businessContact.state"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactPhoneNumber">Phone</label>
                    <input
                      type="text"
                      id="contactPhoneNumber"
                      name="business.businessContact.phoneNumber"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactEmail">Email</label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="business.businessContact.email"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Step 3: Principals & Additional Details */}
            <FormSection
              active={currentStep === 3}
              id="step3"
              title="Principals & Additional Details"
            >
              <div id="principalsContainer">
                {formData.principals?.map((principal, index) => (
                  <div key={index} className="principal-form">
                    <div className="array-section-title">Principal {index + 1}</div>
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
                    </div>

                    <div className="form-grid">
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
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor={`principals[${index}].equityOwnershipPercentage`}>Ownership % <span className="required">*</span></label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          id={`principals[${index}].equityOwnershipPercentage`}
                          name={`principals[${index}].equityOwnershipPercentage`}
                          value={principal.equityOwnershipPercentage || ''}
                          onChange={(e) => handlePrincipalChange(index, 'equityOwnershipPercentage', Number(e.target.value))}
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
              </div>

              <button
                type="button"
                onClick={() => addPrincipal()}
                className="btn-info"
              >
                ➕ Add Principal
              </button>

              <div className="form-group">
                <label htmlFor="statementDeliveryMethod">Statement Delivery Method</label>
                <input
                  type="text"
                  id="statementDeliveryMethod"
                  name="business.statementDeliveryMethod"
                  value={formData.business?.statementDeliveryMethod || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="array-section">
                <div className="array-section-title">Business Addresses</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="dbaStreet">DBA Street</label>
                    <input
                      type="text"
                      id="dbaStreet"
                      name="business.businessAddress.dba.street"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dbaCity">DBA City</label>
                    <input
                      type="text"
                      id="dbaCity"
                      name="business.businessAddress.dba.city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dbaState">DBA State</label>
                    <input
                      type="text"
                      id="dbaState"
                      name="business.businessAddress.dba.state"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dbaZipCode">DBA Zip</label>
                    <input
                      type="text"
                      id="dbaZipCode"
                      name="business.businessAddress.dba.zipCode"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="corporateStreet">Corporate Street</label>
                    <input
                      type="text"
                      id="corporateStreet"
                      name="business.businessAddress.corporate.street"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="corporateCity">Corporate City</label>
                    <input
                      type="text"
                      id="corporateCity"
                      name="business.businessAddress.corporate.city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="corporateState">Corporate State</label>
                    <input
                      type="text"
                      id="corporateState"
                      name="business.businessAddress.corporate.state"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="corporateZipCode">Corporate Zip</label>
                    <input
                      type="text"
                      id="corporateZipCode"
                      name="business.businessAddress.corporate.zipCode"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="shipToStreet">ShipTo Street</label>
                    <input
                      type="text"
                      id="shipToStreet"
                      name="business.businessAddress.shipTo.street"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shipToCity">ShipTo City</label>
                    <input
                      type="text"
                      id="shipToCity"
                      name="business.businessAddress.shipTo.city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shipToState">ShipTo State</label>
                    <input
                      type="text"
                      id="shipToState"
                      name="business.businessAddress.shipTo.state"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shipToZipCode">ShipTo Zip</label>
                    <input
                      type="text"
                      id="shipToZipCode"
                      name="business.businessAddress.shipTo.zipCode"
                    />
                  </div>
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">Website Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="websiteUrl">Website URL</label>
                    <input
                      type="text"
                      id="websiteUrl"
                      name="business.websites[0].url"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="websiteCustomerServiceEmail">Customer Service Email</label>
                    <input
                      type="email"
                      id="websiteCustomerServiceEmail"
                      name="business.websites[0].websiteCustomerServiceEmail"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="websiteCustomerServicePhoneNumber">Customer Service Phone</label>
                    <input
                      type="text"
                      id="websiteCustomerServicePhoneNumber"
                      name="business.websites[0].websiteCustomerServicePhoneNumber"
                    />
                  </div>
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">EBT Services</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="ebtType">EBT Type</label>
                    <input
                      type="text"
                      id="ebtType"
                      name="business.businessServicesRequested[0].ebt[0].ebtType"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ebtAccountNumber">EBT Account Number</label>
                    <input
                      type="text"
                      id="ebtAccountNumber"
                      name="business.businessServicesRequested[0].ebt[0].ebtAccountNumber"
                    />
                  </div>
                </div>
              </div>

              <div className="array-section">
                <div className="array-section-title">Bank Account Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="abaRouting">ABA Routing</label>
                    <input
                      type="text"
                      id="abaRouting"
                      name="bankAccount.abaRouting"
                      value={formData.bankAccount?.abaRouting || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accountType">Account Type</label>
                    <input
                      type="text"
                      id="accountType"
                      name="bankAccount.accountType"
                      value={formData.bankAccount?.accountType || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandDepositAccount">Demand Deposit Account</label>
                    <input
                      type="text"
                      id="demandDepositAccount"
                      name="bankAccount.demandDepositAccount"
                      value={formData.bankAccount?.demandDepositAccount || ''}
                      onChange={handleInputChange}
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
