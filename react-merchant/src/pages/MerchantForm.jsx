import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import ProgressBar from '../components/ProgressBar';
import ThankYouMessage from '../components/ThankYouMessage';
import ErrorModal from '../components/ErrorModal';
import Toast from '../components/Toast';
import DocumentUpload from '../components/DocumentUpload';
import {
  getApplication,
  getApplicationDataSummary,
  validateApplication,
  submitToUnderwriting,
  saveApplication,
  updateApplication
} from '../services/api';

const MerchantForm = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [formData, setFormData] = useState({
    agent: 96194,
    applicationName: '',
    externalKey: '',
    plan: {
      planId: '',
      equipmentCostToMerchant: 0,
      accountSetupFee: 0,
      discountFrequency: 'Daily',
      equipment: [{ equipmentId: 1155, quantity: 1 }],
    },
    shipping: {
      shippingDestination: 'DBA',
      deliveryMethod: 'Ground',
    },
    business: {
      corporateName: '',
      dbaName: '',
      businessType: '',
      federalTaxIdNumber: '',
      federalTaxIdType: 'EIN',
      mcc: '',
      phone: '',
      email: '',
      averageTicketAmount: '',
      averageMonthlyVolume: '',
      highTicketAmount: '',
      merchandiseServicesSold: '',
      percentOfBusinessTransactions: {
        cardSwiped: '',
        keyedCardPresentNotImprinted: '',
        mailOrPhoneOrder: '',
        internet: '',
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
      businessAddress: {
        dba: { street: '', city: '', state: '', zipCode: '' },
        corporate: { street: '', city: '', state: '', zipCode: '' },
        shipTo: { street: '', city: '', state: '', zipCode: '' },
      },
      websites: [{ url: '', websiteCustomerServiceEmail: '', websiteCustomerServicePhoneNumber: '' }],
      ebt: { ebtType: '', ebtAccountNumber: '' },
    },
    principals: [],
    bankAccount: {
      abaRouting: '',
      accountType: 'checking',
      demandDepositAccount: '',
    },
    statementDeliveryMethod: 'electronic',
    // Add missing fields that might be needed
    applicationEmail: '',
    status: 'draft',
    documents: [],
    merchantLink: '',
  });

  const [showThankYou, setShowThankYou] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState(null);
  const [validationResponse, setValidationResponse] = useState(null);
  const [isExistingApplication, setIsExistingApplication] = useState(false);
  const [errors, setErrors] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [bankVerificationRequired, setBankVerificationRequired] = useState(false);
  const [toast, setToast] = useState(null);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.externalKey) {
      localStorage.setItem(`formData_${formData.externalKey}`, JSON.stringify(formData));
    }
  }, [formData]);

  // Load form data from localStorage on component mount
  useEffect(() => {
    const externalKey = searchParams.get('key');
    if (externalKey) {
      const savedFormData = localStorage.getItem(`formData_${externalKey}`);
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
          setIsExistingApplication(true);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  }, [searchParams]);

  // Ensure all nested objects are properly initialized
  useEffect(() => {
    console.log('🔧 Initializing form data structure...');
    setFormData(prev => {
      const updated = { ...prev };
      
      // Ensure business object exists
      if (!updated.business) {
        console.log('📝 Creating business object structure...');
        updated.business = {
          corporateName: '',
          dbaName: '',
          businessType: '',
          federalTaxIdNumber: '',
          federalTaxIdType: 'EIN',
          mcc: '',
          phone: '',
          email: '',
          averageTicketAmount: '',
          averageMonthlyVolume: '',
          highTicketAmount: '',
          merchandiseServicesSold: '',
          percentOfBusinessTransactions: {
            cardSwiped: '',
            keyedCardPresentNotImprinted: '',
            mailOrPhoneOrder: '',
            internet: '',
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
          businessAddress: {
            dba: { street: '', city: '', state: '', zipCode: '' },
            corporate: { street: '', city: '', state: '', zipCode: '' },
            shipTo: { street: '', city: '', state: '', zipCode: '' },
          },
          websites: [{ url: '', websiteCustomerServiceEmail: '', websiteCustomerServicePhoneNumber: '' }],
          ebt: { ebtType: '', ebtAccountNumber: '' },
        };
      }
      
      // Ensure other required objects exist
      if (!updated.plan) {
        updated.plan = {
          planId: '',
          equipmentCostToMerchant: 0,
          accountSetupFee: 0,
          discountFrequency: 'Daily',
          equipment: [{ equipmentId: 1155, quantity: 1 }],
        };
      }
      
      if (!updated.shipping) {
        updated.shipping = {
          shippingDestination: 'DBA',
          deliveryMethod: 'Ground',
        };
      }
      
      if (!updated.bankAccount) {
        updated.bankAccount = {
          abaRouting: '',
          accountType: 'checking',
          demandDepositAccount: '',
        };
      }
      
      if (!updated.principals || updated.principals.length === 0) {
        console.log('👥 Initializing principals array with default principal...');
        updated.principals = [{
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
          isPersonalGuarantor: false,
          driverLicenseNumber: '',
          driverLicenseIssuedState: '',
        }];
      }
      
      if (!updated.statementDeliveryMethod) {
        updated.statementDeliveryMethod = 'electronic';
      }
      
      console.log('✅ Form data structure initialized:', {
        hasBusiness: !!updated.business,
        hasBusinessAddress: !!updated.business?.businessAddress,
        hasBusinessContact: !!updated.business?.businessContact,
        hasPercentOfBusinessTransactions: !!updated.business?.percentOfBusinessTransactions,
        hasWebsites: !!updated.business?.websites,
        hasEbt: !!updated.business?.ebt
      });
      
      return updated;
    });
  }, []);

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;
    
    // Debug logging for principal fields
    if (name.includes('principals')) {
      console.log('🔍 Principal field change:', { name, value: processedValue, type, checked });
    }

    // Convert to number if the field is numeric
    if (type === 'number' || name.includes('plan.') || name.includes('equipment') || name.includes('percentOfBusinessTransactions') || name.includes('accountSetupFee') || name.includes('equipmentCostToMerchant') || name.includes('equityOwnershipPercentage')) {
      processedValue = value === '' ? '' : Number(value);
    }

    // Handle date fields
    if (type === 'date') {
      processedValue = value;
    }

    // Clear any previous errors when user starts typing
    if (errors) {
      setErrors(null);
    }
    
    // Mark that there are unsaved changes
    setHasUnsavedChanges(true);

    // Handle principals array fields (e.g., principals[0].firstName)
    if (name.includes('principals[') && name.includes(']')) {
      const match = name.match(/principals\[(\d+)\]\.(.+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        
        setFormData((prev) => {
          const newState = { ...prev };
          
          // Ensure principals array exists
          if (!newState.principals) {
            newState.principals = [];
          }
          
          // Ensure the principal at the specified index exists
          if (!newState.principals[index]) {
            newState.principals[index] = {};
          }
          
          // Update the specific field
          newState.principals[index][field] = processedValue;
          
          console.log('✅ Updated principal field:', { index, field, value: processedValue });
          console.log('📝 New principals state:', newState.principals);
          
          return newState;
        });
        return;
      }
    }

    // Handle nested fields (e.g., business.corporateName, plan.planId, business.websites.0.url)
    if (name.includes('.')) {
      const keys = name.split('.');
      
      setFormData((prev) => {
        const newState = { ...prev };
        let current = newState;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          
          // Handle array indices (e.g., websites.0.url)
          if (!isNaN(key) && Array.isArray(current)) {
            // Ensure array exists and has enough elements
            while (current.length <= parseInt(key)) {
              current.push({});
            }
            current = current[parseInt(key)];
          } else if (!isNaN(key) && !Array.isArray(current)) {
            // Convert to array if needed
            current[key] = [];
            while (current[key].length <= parseInt(key)) {
              current[key].push({});
            }
            current = current[key][parseInt(key)];
          } else {
            // Handle regular object keys
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        }
        
        // Set the final value
        const lastKey = keys[keys.length - 1];
        current[lastKey] = processedValue;
        
        return newState;
      });
    } else {
      // Handle simple fields
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };


  const loadApplicationData = async (externalKey) => {
    setIsLoading(true);
    setLoadingMessage('Loading application data...');
    try {
      const data = await getApplication(externalKey);
      
      if (data && data.status !== 'error') {
        // Prioritize MongoDB data, fallback to PaymentsHub data
        const appData = data.mongoApplication || data.paymentsHubResponse || data;
        
        if (appData) {
          console.log('📥 Application data loaded:', {
            hasBusiness: !!appData.business,
            hasPrincipals: !!appData.principals,
            hasPlan: !!appData.principals,
            hasBankAccount: !!appData.bankAccount,
            hasShipping: !!appData.shipping,
            hasStatementDelivery: !!appData.statementDeliveryMethod,
            businessFields: appData.business ? Object.keys(appData.business) : [],
            principalCount: appData.principals ? appData.principals.length : 0
          });
          
          const formattedData = formatDatesInResponse(appData);
          console.log('📝 Formatted data:', formattedData);
          setFormData(formattedData);
          setDocuments(appData.documents || []);
          
          // Set existing application flag
          setIsExistingApplication(true);
          
          setToast({
            message: 'Application data loaded successfully!',
            type: 'success'
          });
        } else {
          console.warn('No application data found');
        }
      } else {
        console.error('Failed to load application data:', data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error loading application data:', error);
      // Don't show error modal for loading failures, just log them
    } finally {
      setIsLoading(false);
    }
  };

  const formatDatesInResponse = (data) => {
    if (!data) return data;

    const formatted = { ...data };

    // Handle business data structure
    if (formatted['business?']) {
      formatted.business = formatted['business?'];
      delete formatted['business?'];
    }

    // Ensure business object exists with all nested objects
    if (!formatted.business) {
      formatted.business = {
        corporateName: '',
        dbaName: '',
        businessType: '',
        federalTaxIdNumber: '',
        federalTaxIdType: 'EIN',
        mcc: '',
        phone: '',
        email: '',
        averageTicketAmount: '',
        averageMonthlyVolume: '',
        highTicketAmount: '',
        merchandiseServicesSold: '',
        percentOfBusinessTransactions: {
          cardSwiped: '',
          keyedCardPresentNotImprinted: '',
          mailOrPhoneOrder: '',
          internet: '',
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
        businessAddress: {
          dba: { street: '', city: '', state: '', zipCode: '' },
          corporate: { street: '', city: '', state: '', zipCode: '' },
          shipTo: { street: '', city: '', state: '', zipCode: '' },
        },
        websites: [{ url: '', websiteCustomerServiceEmail: '', websiteCustomerServicePhoneNumber: '' }],
        ebt: { ebtType: '', ebtAccountNumber: '' },
      };
    } else {
      // Ensure nested objects exist even if business object exists
      if (!formatted.business.percentOfBusinessTransactions) {
        formatted.business.percentOfBusinessTransactions = {
          cardSwiped: '',
          keyedCardPresentNotImprinted: '',
          mailOrPhoneOrder: '',
          internet: '',
        };
      }
      
      if (!formatted.business.businessContact) {
        formatted.business.businessContact = {
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
        };
      }
      
      if (!formatted.business.businessAddress) {
        formatted.business.businessAddress = {
          dba: { street: '', city: '', state: '', zipCode: '' },
          corporate: { street: '', city: '', state: '', zipCode: '' },
          shipTo: { street: '', city: '', state: '', zipCode: '' },
        };
      } else {
        // Ensure each address type exists
        if (!formatted.business.businessAddress.dba) {
          formatted.business.businessAddress.dba = { street: '', city: '', state: '', zipCode: '' };
        }
        if (!formatted.business.businessAddress.corporate) {
          formatted.business.businessAddress.corporate = { street: '', city: '', state: '', zipCode: '' };
        }
        if (!formatted.business.businessAddress.shipTo) {
          formatted.business.businessAddress.shipTo = { street: '', city: '', state: '', zipCode: '' };
        }
      }
      
      if (!formatted.business.websites || !Array.isArray(formatted.business.websites)) {
        formatted.business.websites = [{ url: '', websiteCustomerServiceEmail: '', websiteCustomerServicePhoneNumber: '' }];
      }
      
      if (!formatted.business.ebt) {
        formatted.business.ebt = { ebtType: '', ebtAccountNumber: '' };
      }
    }

    // Ensure plan object exists
    if (!formatted.plan) {
      formatted.plan = {
        planId: '',
        equipmentCostToMerchant: 0,
        accountSetupFee: 0,
        discountFrequency: 'Daily',
        equipment: [{ equipmentId: 1155, quantity: 1 }],
      };
    }

    // Ensure shipping object exists
    if (!formatted.shipping) {
      formatted.shipping = {
        shippingDestination: 'DBA',
        deliveryMethod: 'Ground',
      };
    }

    // Ensure bankAccount object exists
    if (!formatted.bankAccount) {
      formatted.bankAccount = {
        abaRouting: '',
        accountType: 'checking',
        demandDepositAccount: '',
      };
    }

    // Ensure principals array exists and has at least one principal
    if (!formatted.principals || !Array.isArray(formatted.principals) || formatted.principals.length === 0) {
      console.log('👥 No principals found, creating default principal...');
      formatted.principals = [{
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
        isPersonalGuarantor: false,
        driverLicenseNumber: '',
        driverLicenseIssuedState: '',
      }];
    } else {
      // Format dates in existing principals
      formatted.principals = formatted.principals.map((principal) => ({
        ...principal,
        dateOfBirth: formatDateForInput(principal.dateOfBirth),
      }));
    }

    // Format business contact date of birth
    if (formatted.business?.businessContact?.dateOfBirth) {
      formatted.business.businessContact.dateOfBirth = formatDateForInput(
        formatted.business.businessContact.dateOfBirth
      );
    }

    // Ensure default values for required fields
    if (!formatted.agent) formatted.agent = 96194;
    if (!formatted.applicationName) formatted.applicationName = '';
    if (!formatted.externalKey) formatted.externalKey = '';
    if (!formatted.statementDeliveryMethod) formatted.statementDeliveryMethod = 'electronic';

    return formatted;
  };

  const saveForm = async () => {
    setIsLoading(true);
    setLoadingMessage('Saving application...');
    setSuccessMessage(''); // Clear any previous success message
    setErrors(null); // Clear any previous errors
    try {
      const dataToSend = { ...formData };
      if (dataToSend['business?']) {
        dataToSend.business = dataToSend['business?'];
        delete dataToSend['business?'];
      }

      // Log the complete data being sent
      console.log('💾 Saving complete form data to MongoDB:', {
        externalKey: dataToSend.externalKey,
        agent: dataToSend.agent,
        applicationName: dataToSend.applicationName,
        plan: dataToSend.plan,
        shipping: dataToSend.shipping,
        business: {
          corporateName: dataToSend.business?.corporateName,
          dbaName: dataToSend.business?.dbaName,
          businessType: dataToSend.business?.businessType,
          federalTaxIdNumber: dataToSend.business?.federalTaxIdNumber,
          mcc: dataToSend.business?.mcc,
          phone: dataToSend.business?.phone,
          email: dataToSend.business?.email,
          averageTicketAmount: dataToSend.business?.averageTicketAmount,
          averageMonthlyVolume: dataToSend.business?.averageMonthlyVolume,
          highTicketAmount: dataToSend.business?.highTicketAmount,
          merchandiseServicesSold: dataToSend.business?.merchandiseServicesSold,
          percentOfBusinessTransactions: dataToSend.business?.percentOfBusinessTransactions,
          businessContact: dataToSend.business?.businessContact,
          businessAddress: dataToSend.business?.businessAddress,
          websites: dataToSend.business?.websites,
          ebt: dataToSend.business?.ebt
        },
        principals: dataToSend.principals,
        bankAccount: dataToSend.bankAccount,
        statementDeliveryMethod: dataToSend.statementDeliveryMethod,
        documents: dataToSend.documents
      });

      // Use the new save endpoint that only saves to MongoDB
      const response = await saveApplication(dataToSend.externalKey, dataToSend);
      
      if (response?.status === 'success' && response?.mongoApplication?.externalKey) {
        // Don't overwrite the current form data - just update the timestamp
        // This keeps the user's current input intact
        setIsExistingApplication(true);
        
        // Also save to localStorage for frontend persistence
        if (response.mongoApplication?.externalKey) {
          localStorage.setItem(`formData_${response.mongoApplication.externalKey}`, JSON.stringify(formData));
        }
        
        // Show success toast instead of modal
        setToast({
          message: 'Application saved successfully!',
          type: 'success'
        });
        setLastSaved(new Date());
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        console.log('✅ Application saved successfully to MongoDB');
        
        // Log what was actually saved
        console.log('📊 MongoDB response:', response.mongoApplication);
      } else {
        throw new Error('Invalid response from save endpoint');
      }
    } catch (error) {
      console.error('❌ Error saving application:', error);
      // Show error toast
      setToast({
        message: 'Failed to save application. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpdate = (newDocument, deletedDocumentId) => {
    if (deletedDocumentId) {
      setDocuments(prev => prev.filter(doc => doc._id !== deletedDocumentId));
    } else if (newDocument) {
      setDocuments(prev => [...prev, newDocument]);
    }
  };

  const validateBankInfo = () => {
    // This is a placeholder function - implement actual bank validation logic
    const requiresVerification = true; // This should be determined by your business logic
    setBankVerificationRequired(requiresVerification);
    return requiresVerification;
  };

  // Clean and prepare form data for PaymentsHub API
  const cleanFormDataForPaymentsHub = (data) => {
    const cleaned = JSON.parse(JSON.stringify(data)); // Deep clone
    
    // Valid US state codes
    const validStates = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'];
    
    // Valid titles (lowercase)
    const validTitles = ['ceo', 'manager', 'owner', 'partner', 'president', 'vice president'];
    
    // Helper to validate and normalize state code (must be exactly 2 characters and valid)
    // If empty, returns default state "CA" since state is required
    const normalizeState = (state, defaultState = 'CA') => {
      if (!state || typeof state !== 'string' || state.trim() === '') {
        return defaultState; // Use default since state is required
      }
      const normalized = state.trim().toUpperCase().substring(0, 2);
      return validStates.includes(normalized) ? normalized : defaultState;
    };
    
    // Helper to normalize SSN (must be 9 digits OR 4 digits based on pattern)
    const normalizeSSN = (ssn) => {
      if (!ssn) return '';
      // Remove all non-digits
      const digits = ssn.toString().replace(/\D/g, '');
      // Pattern allows 9 digits or 4 digits - take appropriate length
      if (digits.length === 4) {
        return digits; // Keep 4 digits as-is
      }
      // Return only first 9 digits (max allowed)
      return digits.substring(0, 9);
    };
    
    // Helper to normalize phone (must be exactly 10 digits)
    const normalizePhone = (phone) => {
      if (!phone) return '';
      // Remove all non-digits
      const digits = phone.toString().replace(/\D/g, '');
      // Return only first 10 digits
      return digits.substring(0, 10);
    };
    
    // Helper to normalize MCC (must be exactly 4 digits)
    // We normalize to 4 digits but let PaymentsHub validate if it's a valid MCC code
    const normalizeMCC = (mcc) => {
      if (!mcc || (typeof mcc === 'string' && mcc.trim() === '')) {
        return null; // Only return null if truly empty
      }
      // Remove all non-digits
      const digits = mcc.toString().replace(/\D/g, '');
      // Must be exactly 4 digits - pad or truncate as needed
      if (digits.length === 0) return null;
      if (digits.length < 4) {
        return digits.padStart(4, '0');
      }
      return digits.substring(0, 4);
    };
    
    // Helper to normalize title (must be lowercase and valid)
    const normalizeTitle = (title) => {
      if (!title) return '';
      const normalized = title.toString().trim().toLowerCase();
      return validTitles.includes(normalized) ? normalized : '';
    };
    
    // Helper to get a value or use application name as fallback
    const getValueOrAppName = (value, fallback = '') => {
      if (value && value.toString().trim() !== '') {
        return value.toString().trim();
      }
      return cleaned.applicationName || fallback || 'Business';
    };
    
    // Handle business data
    if (cleaned.business) {
      // Convert empty strings to proper numbers (0) for required number fields
      if (cleaned.business.averageTicketAmount === '' || cleaned.business.averageTicketAmount === null || cleaned.business.averageTicketAmount === undefined) {
        cleaned.business.averageTicketAmount = 0;
      } else if (typeof cleaned.business.averageTicketAmount === 'string') {
        const parsed = parseFloat(cleaned.business.averageTicketAmount);
        cleaned.business.averageTicketAmount = isNaN(parsed) ? 0 : parsed;
      } else if (typeof cleaned.business.averageTicketAmount !== 'number') {
        cleaned.business.averageTicketAmount = 0;
      }
      
      if (cleaned.business.averageMonthlyVolume === '' || cleaned.business.averageMonthlyVolume === null || cleaned.business.averageMonthlyVolume === undefined) {
        cleaned.business.averageMonthlyVolume = 0;
      } else if (typeof cleaned.business.averageMonthlyVolume === 'string') {
        const parsed = parseFloat(cleaned.business.averageMonthlyVolume);
        cleaned.business.averageMonthlyVolume = isNaN(parsed) ? 0 : parsed;
      } else if (typeof cleaned.business.averageMonthlyVolume !== 'number') {
        cleaned.business.averageMonthlyVolume = 0;
      }
      
      if (cleaned.business.highTicketAmount === '' || cleaned.business.highTicketAmount === null || cleaned.business.highTicketAmount === undefined) {
        cleaned.business.highTicketAmount = 0;
      } else if (typeof cleaned.business.highTicketAmount === 'string') {
        const parsed = parseFloat(cleaned.business.highTicketAmount);
        cleaned.business.highTicketAmount = isNaN(parsed) ? 0 : parsed;
      } else if (typeof cleaned.business.highTicketAmount !== 'number') {
        cleaned.business.highTicketAmount = 0;
      }
      
      // Ensure text fields are non-empty strings - use application name if available
      cleaned.business.corporateName = getValueOrAppName(cleaned.business.corporateName, cleaned.business.dbaName);
      cleaned.business.dbaName = getValueOrAppName(cleaned.business.dbaName, cleaned.business.corporateName);
      cleaned.business.federalTaxIdNumber = getValueOrAppName(cleaned.business.federalTaxIdNumber, '000000000');
      
      // Normalize MCC - only include if it has a value and is not clearly invalid
      const normalizedMCC = normalizeMCC(cleaned.business.mcc);
      if (normalizedMCC && normalizedMCC !== '0000') {
        cleaned.business.mcc = normalizedMCC;
      } else {
        // Remove MCC if it's empty or clearly invalid (0000) - PaymentsHub will validate if required
        delete cleaned.business.mcc;
      }
      
      cleaned.business.merchandiseServicesSold = getValueOrAppName(cleaned.business.merchandiseServicesSold, 'General Merchandise');
      
      // For phone and email, try to get from contact first
      if (!cleaned.business.phone || cleaned.business.phone.trim() === '') {
        cleaned.business.phone = normalizePhone(cleaned.business.businessContact?.phoneNumber);
      } else {
        cleaned.business.phone = normalizePhone(cleaned.business.phone);
      }
      if (!cleaned.business.email || cleaned.business.email.trim() === '') {
        cleaned.business.email = cleaned.business.businessContact?.email || cleaned.applicationEmail || '';
      }
      
      // Ensure business contact exists and is complete with validated data
      const contact = cleaned.business.businessContact || {};
      // Get default state (use CA as fallback)
      const defaultContactState = normalizeState(contact.state || cleaned.business.businessAddress?.dba?.state, 'CA');
      cleaned.business.businessContact = {
        firstName: contact.firstName || cleaned.business.corporateName?.split(' ')[0] || 'Business',
        lastName: contact.lastName || cleaned.business.corporateName?.split(' ').slice(1).join(' ') || 'Contact',
        socialSecurityNumber: normalizeSSN(contact.socialSecurityNumber), // Must be 9 digits max
        dateOfBirth: contact.dateOfBirth || '',
        phoneNumber: normalizePhone(contact.phoneNumber || cleaned.business.phone),
        email: contact.email || cleaned.business.email || '',
        street: contact.street || cleaned.business.businessAddress?.dba?.street || '',
        street2: contact.street2 || '',
        city: contact.city || cleaned.business.businessAddress?.dba?.city || '',
        state: defaultContactState, // Must be valid 2-char state, use CA as default
        zipCode: contact.zipCode || cleaned.business.businessAddress?.dba?.zipCode || ''
      };
      
      // Ensure business address exists with validated state codes
      const address = cleaned.business.businessAddress || {};
      const dbaStreet = address.dba?.street || cleaned.business.businessContact.street || '';
      const dbaCity = address.dba?.city || cleaned.business.businessContact.city || '';
      // Use contact state as base, then normalize with CA as default
      const dbaState = normalizeState(address.dba?.state || cleaned.business.businessContact.state, 'CA');
      const dbaZip = address.dba?.zipCode || cleaned.business.businessContact.zipCode || '';
      
      cleaned.business.businessAddress = {
        dba: {
          street: dbaStreet,
          city: dbaCity,
          state: dbaState, // Ensure valid state
          zipCode: dbaZip
        },
        corporate: {
          street: address.corporate?.street || dbaStreet,
          city: address.corporate?.city || dbaCity,
          state: normalizeState(address.corporate?.state || dbaState, 'CA'), // Ensure valid state
          zipCode: address.corporate?.zipCode || dbaZip
        },
        shipTo: {
          street: address.shipTo?.street || dbaStreet,
          city: address.shipTo?.city || dbaCity,
          state: normalizeState(address.shipTo?.state || dbaState, 'CA'), // Ensure valid state
          zipCode: address.shipTo?.zipCode || dbaZip
        }
      };
      
      // Handle EBT - only include if it has data, otherwise remove it
      if (cleaned.business.ebt) {
        if (!cleaned.business.ebt.ebtType || cleaned.business.ebt.ebtType.trim() === '') {
          delete cleaned.business.ebt;
        } else if (!cleaned.business.ebt.ebtAccountNumber || cleaned.business.ebt.ebtAccountNumber.trim() === '') {
          // If ebtType exists but no account number, remove the whole ebt object
          delete cleaned.business.ebt;
        }
      }
    }
    
    // Ensure bankAccount has valid accountType
    if (cleaned.bankAccount) {
      const accountType = cleaned.bankAccount.accountType?.toString().toLowerCase().trim();
      if (accountType === 'checking' || accountType === 'savings') {
        cleaned.bankAccount.accountType = accountType;
      } else {
        // Default to checking if invalid
        cleaned.bankAccount.accountType = 'checking';
      }
    }
    
    // Ensure principals array exists and has at least one principal with validated data
    if (!cleaned.principals || !Array.isArray(cleaned.principals) || cleaned.principals.length === 0) {
      // Create a principal from business contact data
      // Get default state - use business contact state or CA as fallback
      const defaultPrincipalState = normalizeState(
        cleaned.business?.businessContact?.state || cleaned.business?.businessAddress?.dba?.state,
        'CA'
      );
      cleaned.principals = [{
        firstName: cleaned.business?.businessContact?.firstName || cleaned.business?.corporateName?.split(' ')[0] || 'Principal',
        lastName: cleaned.business?.businessContact?.lastName || cleaned.business?.corporateName?.split(' ').slice(1).join(' ') || 'Owner',
        socialSecurityNumber: normalizeSSN(cleaned.business?.businessContact?.socialSecurityNumber),
        dateOfBirth: cleaned.business?.businessContact?.dateOfBirth || '',
        phoneNumber: normalizePhone(cleaned.business?.businessContact?.phoneNumber || cleaned.business?.phone),
        email: cleaned.business?.businessContact?.email || cleaned.business?.email || '',
        street: cleaned.business?.businessContact?.street || cleaned.business?.businessAddress?.dba?.street || '',
        street2: cleaned.business?.businessContact?.street2 || '',
        city: cleaned.business?.businessContact?.city || cleaned.business?.businessAddress?.dba?.city || '',
        state: defaultPrincipalState, // Ensure valid state with CA as default
        zipCode: cleaned.business?.businessContact?.zipCode || cleaned.business?.businessAddress?.dba?.zipCode || '',
        equityOwnershipPercentage: 100,
        title: normalizeTitle('owner'), // Use normalized title
        isPersonalGuarantor: false,
        driverLicenseNumber: '',
        driverLicenseIssuedState: defaultPrincipalState // Required field - use same as principal state
      }];
    } else {
      // Clean and ensure all principals have required fields with validated values
      cleaned.principals = cleaned.principals.map((principal, index) => {
        // Use business contact data if principal fields are empty
        const firstName = principal.firstName || cleaned.business?.businessContact?.firstName || cleaned.business?.corporateName?.split(' ')[0] || `Principal ${index + 1}`;
        const lastName = principal.lastName || cleaned.business?.businessContact?.lastName || cleaned.business?.corporateName?.split(' ').slice(1).join(' ') || 'Owner';
        // Ensure state is valid - use CA as default if empty
        const principalState = normalizeState(
          principal.state || cleaned.business?.businessContact?.state || cleaned.business?.businessAddress?.dba?.state,
          'CA'
        );
        // driverLicenseIssuedState is required - use principal state or CA
        const driverLicenseState = normalizeState(
          principal.driverLicenseIssuedState || principalState,
          'CA'
        );
        
        return {
          firstName,
          lastName,
          socialSecurityNumber: normalizeSSN(principal.socialSecurityNumber || cleaned.business?.businessContact?.socialSecurityNumber),
          dateOfBirth: principal.dateOfBirth || '',
          phoneNumber: normalizePhone(principal.phoneNumber || cleaned.business?.phone),
          email: principal.email || cleaned.business?.email || '',
          street: principal.street || cleaned.business?.businessContact?.street || cleaned.business?.businessAddress?.dba?.street || '',
          street2: principal.street2 || '',
          city: principal.city || cleaned.business?.businessContact?.city || cleaned.business?.businessAddress?.dba?.city || '',
          state: principalState, // Ensure valid state
          zipCode: principal.zipCode || cleaned.business?.businessContact?.zipCode || cleaned.business?.businessAddress?.dba?.zipCode || '',
          equityOwnershipPercentage: typeof principal.equityOwnershipPercentage === 'number' 
            ? principal.equityOwnershipPercentage 
            : (principal.equityOwnershipPercentage ? parseFloat(principal.equityOwnershipPercentage) || 0 : 0),
          title: normalizeTitle(principal.title || 'owner'),
          isPersonalGuarantor: principal.isPersonalGuarantor || false,
          driverLicenseNumber: principal.driverLicenseNumber || '',
          driverLicenseIssuedState: driverLicenseState // Required - ensure valid state
        };
      });
    }
    
    return cleaned;
  };

  const submitForm = async () => {
    setIsLoading(true);
    setLoadingMessage('Validating application...');
    setSuccessMessage(''); // Clear any previous success message
    setErrors(null); // Clear any previous errors
    try {
      // First save the current form data to MongoDB
      await saveForm();

      // Validate bank information
      const needsBankVerification = validateBankInfo();

      // Check if at least one bank verification document is uploaded
      const bankDocs = ['voided_check', 'bank_statement', 'processing_statement'];
      const hasBankDoc = documents.some(doc => bankDocs.includes(doc.type));

      // Clean form data for PaymentsHub
      const cleanedData = cleanFormDataForPaymentsHub(formData);
      
      // Log cleaned data for debugging
      console.log('🧹 Cleaned form data for PaymentsHub:', {
        business: {
          corporateName: cleanedData.business?.corporateName,
          dbaName: cleanedData.business?.dbaName,
          federalTaxIdNumber: cleanedData.business?.federalTaxIdNumber,
          mcc: cleanedData.business?.mcc,
          phone: cleanedData.business?.phone,
          email: cleanedData.business?.email,
          averageTicketAmount: cleanedData.business?.averageTicketAmount,
          averageMonthlyVolume: cleanedData.business?.averageMonthlyVolume,
          highTicketAmount: cleanedData.business?.highTicketAmount,
          merchandiseServicesSold: cleanedData.business?.merchandiseServicesSold,
          hasBusinessContact: !!cleanedData.business?.businessContact,
          hasBusinessAddress: !!cleanedData.business?.businessAddress
        },
        principalsCount: cleanedData.principals?.length || 0
      });
      
      // Update application in PaymentsHub before validation
      setLoadingMessage('Updating application in PaymentsHub...');
      let updateSuccess = false;
      try {
        const updateResponse = await updateApplication(formData.externalKey, cleanedData);
        console.log('✅ Successfully updated PaymentsHub:', updateResponse);
        updateSuccess = true;
        
        // Small delay to ensure PaymentsHub has processed the update
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (updateError) {
        console.error('❌ Failed to update PaymentsHub before validation:', updateError);
        if (updateError.response?.data) {
          console.error('Update error details:', updateError.response.data);
        }
        if (updateError.response?.status) {
          console.error('Update HTTP status:', updateError.response.status);
        }
        
        // Handle 422 validation errors - display them in the ErrorModal
        if (updateError.response?.status === 422) {
          const errorData = updateError.response.data;
          // Check if errors are in the details.data.errors format
          if (errorData.details?.data?.errors) {
            setErrors(errorData.details.data.errors);
          } else if (errorData.data?.errors) {
            setErrors(errorData.data.errors);
          } else if (errorData.errors) {
            setErrors(errorData.errors);
          } else {
            // Fallback to general error
            setErrors({
              general: [
                'Validation failed. Please check the form and try again. ' +
                (errorData.message || updateError.message)
              ]
            });
          }
        } else {
          // For other errors, show general error message
          setErrors({
            general: [
              'Failed to update application data in PaymentsHub. ' +
              'Please ensure all required fields are filled and try again. ' +
              (updateError.response?.data?.message || updateError.message)
            ]
          });
        }
        setIsLoading(false);
        return;
      }
      
      if (!updateSuccess) {
        setErrors({
          general: ['Failed to update application. Please check your data and try again.']
        });
        setIsLoading(false);
        return;
      }

      // Validate the application
      setLoadingMessage('Validating application...');
      const validateData = await validateApplication(formData.externalKey);
      setValidationResponse(validateData);
      
      // Check if validation returned errors (422 response)
      if (validateData && validateData.details && validateData.details.data && validateData.details.data.errors) {
        // Validation failed - show errors
        setErrors(validateData.details.data.errors);
        setIsLoading(false);
        return;
      }
      
      // If validation passed, proceed with submission
      if (validateData) {
        setLoadingMessage('Submitting application to PaymentsHub...');
        
        // Submit to underwriting (this will call PaymentsHub API)
        const submitResponse = await submitToUnderwriting(formData.externalKey, formData);
        
        if (submitResponse?.status === 'success') {
          setSubmissionResponse(submitResponse);
          setShowThankYou(true);
          
          // Clear localStorage after successful submission
          if (formData.externalKey) {
            localStorage.removeItem(`formData_${formData.externalKey}`);
          }
        } else {
          throw new Error(submitResponse?.message || 'Failed to submit application');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        // API error response
        const errorData = error.response.data;
        
        // Check for validation errors in the nested structure (422 response)
        if (errorData.details?.data?.errors) {
          // This is the validation error structure from the 422 response
          setErrors(errorData.details.data.errors);
        } else if (errorData.errors) {
          // Direct errors object
          setErrors(errorData.errors);
        } else if (errorData.error) {
          setErrors({ general: [errorData.error] });
        } else if (errorData.message) {
          setErrors({ general: [errorData.message] });
        } else {
          setErrors({ general: ['Failed to submit application'] });
        }
      } else if (error.message) {
        // Local error
        setErrors({ general: [error.message] });
      } else {
        setErrors({ general: ['Failed to submit application. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const externalKey = searchParams.get('key');
    if (externalKey && !isExistingApplication) {
      setFormData((prev) => ({
        ...prev,
        externalKey,
      }));
      loadApplicationData(externalKey);
      setIsExistingApplication(true);
    }
    // Note: Principal initialization is now handled in the form data structure initialization useEffect
  }, [searchParams, isExistingApplication]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const addPrincipal = (principalData = {}) => {
    setFormData((prev) => ({
      ...prev,
      principals: [
        ...prev.principals,
        {
          firstName: principalData.firstName || '',
          lastName: principalData.lastName || '',
          socialSecurityNumber: principalData.socialSecurityNumber || '',
          dateOfBirth: formatDateForInput(principalData.dateOfBirth) || '',
          phoneNumber: principalData.phoneNumber || '',
          email: principalData.email || '',
          street: principalData.street || '',
          street2: principalData.street2 || '',
          zipCode: principalData.zipCode || '',
          city: principalData.city || '',
          state: principalData.state || '',
          equityOwnershipPercentage: principalData.equityOwnershipPercentage || 0,
          title: principalData.title || '',
          isPersonalGuarantor: principalData.isPersonalGuarantor || false,
          driverLicenseNumber: principalData.driverLicenseNumber || '',
          driverLicenseIssuedState: principalData.driverLicenseIssuedState || '',
        },
      ],
    }));
  };

  const removePrincipal = (index) => {
    setFormData((prev) => {
      const newPrincipals = [...prev.principals];
      newPrincipals.splice(index, 1);
      return {
        ...prev,
        principals: newPrincipals,
      };
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      // Auto-save to localStorage before moving to next step
      if (formData.externalKey && hasUnsavedChanges) {
        localStorage.setItem(`formData_${formData.externalKey}`, JSON.stringify(formData));
        setHasUnsavedChanges(false);
        setToast({
          message: 'Form auto-saved before moving to next step',
          type: 'info'
        });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Auto-save to localStorage before moving to previous step
      if (formData.externalKey && hasUnsavedChanges) {
        localStorage.setItem(`formData_${formData.externalKey}`, JSON.stringify(formData));
        setHasUnsavedChanges(false);
        setToast({
          message: 'Form auto-saved before moving to previous step',
          type: 'info'
        });
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Safety check to prevent rendering with undefined data - less restrictive
  if (!formData.business) {
    console.log('⚠️ Form data not fully initialized yet, showing loading...');
    return (
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Initializing form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {errors && <ErrorModal errors={errors} onClose={() => setErrors(null)} />}
      {showThankYou ? (
        <ThankYouMessage
          submissionResponse={submissionResponse}
          validationResponse={validationResponse}
          onBack={() => setShowThankYou(false)}
        />
      ) : (
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Merchant Application Form</h1>
              <p className="text-white mt-2">Complete merchant and business details for processing</p>
            </div>
            <ProgressBar currentStep={currentStep} totalSteps={3} />
            {hasUnsavedChanges && (
              <div className="mt-2 text-center">
                <span className="text-yellow-400 text-sm">
                  ⚠️ You have unsaved changes. Data will be auto-saved when navigating between steps.
                </span>
              </div>
            )}
            <div className="mt-8 space-y-6">
              {currentStep === 1 && (
                <div className="form-section active space-y-6">
                  <div className="section-title text-2xl font-bold text-white dark:text-white mb-6">
                    General Information
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label htmlFor="agent" className="block text-sm font-medium text-white dark:text-white mb-1">
                        Agent <span className="required text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="agent"
                        name="agent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.agent || ''}
                        onChange={handleInputChange}
                        required
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="applicationName"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Application Name <span className="required text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="applicationName"
                        name="applicationName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.applicationName || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter application name"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="externalKey"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        External Key <span className="required text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="externalKey"
                        name="externalKey"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.externalKey || ''}
                        onChange={handleInputChange}
                        required
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="form-group">
                      <label
                        htmlFor="plan.planId"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Plan ID <span className="required text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="plan.planId"
                        name="plan.planId"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.plan?.planId || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="plan.equipmentCostToMerchant"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Equipment Cost
                      </label>
                      <input
                        type="number"
                        id="plan.equipmentCostToMerchant"
                        name="plan.equipmentCostToMerchant"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.plan?.equipmentCostToMerchant || '0'}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="plan.accountSetupFee"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Setup Fee
                      </label>
                      <input
                        type="number"
                        id="plan.accountSetupFee"
                        name="plan.accountSetupFee"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.plan?.accountSetupFee || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and decimal points
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleInputChange(e);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent non-numeric keys (except backspace, delete, tab, escape, enter, and decimal point)
                          if (
                            ![
                              "Backspace",
                              "Delete",
                              "Tab",
                              "Escape",
                              "Enter",
                              "ArrowLeft",
                              "ArrowRight",
                              "Decimal",
                            ].includes(e.key) &&
                            !/^[0-9]$/.test(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        step="0.05"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="plan.discountFrequency"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Discount Frequency
                      </label>
                      <input
                        type="text"
                        id="plan.discountFrequency"
                        name="plan.discountFrequency"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.plan?.discountFrequency || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Equipment
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.plan.equipment && formData.plan.equipment.length > 0 && (
                        <>
                          <div className="form-group">
                            <label
                              htmlFor="plan.equipment.0.equipmentId"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Equipment ID
                            </label>
                            <input
                              type="number"
                              id="plan.equipment.0.equipmentId"
                              name="plan.equipment.0.equipmentId"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.plan.equipment[0]?.equipmentId || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="plan.equipment.0.quantity"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Quantity
                            </label>
                            <input
                              type="number"
                              id="plan.equipment.0.quantity"
                              name="plan.equipment.0.quantity"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.plan.equipment[0]?.quantity || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label
                        htmlFor="shipping.shippingDestination"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Shipping Destination
                      </label>
                      <input
                        type="text"
                        id="shipping.shippingDestination"
                        name="shipping.shippingDestination"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.shipping?.shippingDestination || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="shipping.deliveryMethod"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Delivery Method
                      </label>
                      <input
                        type="text"
                        id="shipping.deliveryMethod"
                        name="shipping.deliveryMethod"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.shipping?.deliveryMethod || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="form-section space-y-6">
                  <div className="section-title text-2xl font-bold text-white dark:text-white mb-6">
                    Business Information
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label
                        htmlFor="business.corporateName"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Corporate Name
                      </label>
                      <input
                        type="text"
                        id="business.corporateName"
                        name="business.corporateName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.corporateName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter corporate name"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.dbaName"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        DBA Name
                      </label>
                      <input
                        type="text"
                        id="business.dbaName"
                        name="business.dbaName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.dbaName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter DBA name"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.businessType"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Business Type
                      </label>
                      <input
                        type="text"
                        id="business.businessType"
                        name="business.businessType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.businessType || ''}
                        onChange={handleInputChange}
                        placeholder="Enter business type"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.federalTaxIdNumber"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Federal Tax ID
                      </label>
                      <input
                        type="text"
                        id="business.federalTaxIdNumber"
                        name="business.federalTaxIdNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.federalTaxIdNumber || ''}
                        onChange={handleInputChange}
                        placeholder="Enter federal tax ID"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.federalTaxIdType"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Tax ID Type
                      </label>
                      <input
                        type="text"
                        id="business.federalTaxIdType"
                        name="business.federalTaxIdType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.federalTaxIdType || ''}
                        onChange={handleInputChange}
                        placeholder="Enter tax ID type"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.mcc"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        MCC
                      </label>
                      <input
                        type="text"
                        id="business.mcc"
                        name="business.mcc"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.mcc || ''}
                        onChange={handleInputChange}
                        placeholder="Enter MCC"
                      />
                    </div>
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label
                        htmlFor="business.phone"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        id="business.phone"
                        name="business.phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.phone || ''}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.email"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="business.email"
                        name="business.email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                        value={formData.business?.email || ''}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.averageTicketAmount"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Avg Ticket Amount
                      </label>
                      <input
                        type="number"
                        id="business.averageTicketAmount"
                        name="business.averageTicketAmount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.averageTicketAmount || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.averageMonthlyVolume"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Avg Monthly Volume
                      </label>
                      <input
                        type="number"
                        id="business.averageMonthlyVolume"
                        name="business.averageMonthlyVolume"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.averageMonthlyVolume || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.highTicketAmount"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        High Ticket Amount
                      </label>
                      <input
                        type="number"
                        id="business.highTicketAmount"
                        name="business.highTicketAmount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.highTicketAmount || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.merchandiseServicesSold"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Merchandise/Services
                      </label>
                      <input
                        type="text"
                        id="business.merchandiseServicesSold"
                        name="business.merchandiseServicesSold"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.merchandiseServicesSold || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                        Business Transaction Percentages
                      </div>
                    </div>
                    {/* Calculate and display total percentage */}
                    {(() => {
                      const cardSwiped = parseFloat(formData.business?.percentOfBusinessTransactions?.cardSwiped) || 0;
                      const keyedCardPresent = parseFloat(formData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted) || 0;
                      const mailOrPhoneOrder = parseFloat(formData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder) || 0;
                      const internet = parseFloat(formData.business?.percentOfBusinessTransactions?.internet) || 0;
                      const total = cardSwiped + keyedCardPresent + mailOrPhoneOrder + internet;
                      const isValidTotal = total === 100;
                      
                      return (
                        <div className={`mb-4 p-3 rounded-md border ${
                          isValidTotal || total === 0
                            ? 'bg-blue-900/30 border-blue-700 text-blue-200'
                            : 'bg-yellow-900/30 border-yellow-700 text-yellow-200'
                        }`}>
                          <div className="flex items-center">
                            <span className="mr-2">{isValidTotal ? '✓' : '⚠️'}</span>
                            <span className="text-sm">
                              <strong>Total: {total}%</strong> - All 4 percentages must add up to exactly 100%
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.percentOfBusinessTransactions.cardSwiped"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Card Swiped (%)
                        </label>
                        <input
                          type="number"
                          id="business.percentOfBusinessTransactions.cardSwiped"
                          name="business.percentOfBusinessTransactions.cardSwiped"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                                  value={formData.business?.percentOfBusinessTransactions?.cardSwiped || ''}
                        onChange={handleInputChange}
                        placeholder="%"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Keyed Card Present (%)
                      </label>
                      <input
                        type="number"
                        id="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                        name="business.percentOfBusinessTransactions.keyedCardPresentNotImprinted"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={
                          formData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted || ''
                        }
                        onChange={handleInputChange}
                        placeholder="%"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Mail/Phone Order (%)
                      </label>
                      <input
                        type="number"
                        id="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                        name="business.percentOfBusinessTransactions.mailOrPhoneOrder"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder || ''}
                        onChange={handleInputChange}
                        placeholder="%"
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business.percentOfBusinessTransactions.internet"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Internet (%)
                      </label>
                      <input
                        type="number"
                        id="business.percentOfBusinessTransactions.internet"
                        name="business.percentOfBusinessTransactions.internet"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.percentOfBusinessTransactions?.internet || ''}
                        onChange={handleInputChange}
                        placeholder="%"
                      />
                    </div>
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Business Contact
                    </div>
                                            <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.firstName"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              First Name
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.firstName"
                              name="business.businessContact.firstName"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.firstName || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.lastName"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.lastName"
                              name="business.businessContact.lastName"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.lastName || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.socialSecurityNumber"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              SSN
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.socialSecurityNumber"
                              name="business.businessContact.socialSecurityNumber"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.socialSecurityNumber || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.dateOfBirth"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              id="business.businessContact.dateOfBirth"
                              name="business.businessContact.dateOfBirth"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.dateOfBirth || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                                            <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.street"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Street
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.street"
                              name="business.businessContact.street"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.street || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.street2"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Street 2
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.street2"
                              name="business.businessContact.street2"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.street2 || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.zipCode"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Zip Code
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.zipCode"
                              name="business.businessContact.zipCode"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.zipCode || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.city"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              City
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.city"
                              name="business.businessContact.city"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.city || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.state"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              State
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.state"
                              name="business.businessContact.state"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.state || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.phoneNumber"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              id="business.businessContact.phoneNumber"
                              name="business.businessContact.phoneNumber"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.phoneNumber || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="business.businessContact.email"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              id="business.businessContact.email"
                              name="business.businessContact.email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.business?.businessContact?.email || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="form-section">
                  <div className="section-title text-2xl font-bold text-white dark:text-white mb-6">
                    Principals & Additional Details
                  </div>
                  <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-md">
                    <div className="flex items-center">
                      <div className="text-blue-300 mr-2">👥</div>
                      <span className="text-blue-200 text-sm">
                        Principals are individuals with ownership or control over the business. Fill out all required fields marked with <span className="text-red-400">*</span>.
                      </span>
                    </div>
                  </div>
                  <div id="principalsContainer">
                    {console.log('🔍 Rendering principals:', formData.principals)}
                    {formData.principals?.map((principal, index) => (
                      <div key={index} className="principal-section space-y-4 mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                            Principal {index + 1}
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                            onClick={() => removePrincipal(index)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].firstName`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].firstName`}
                              name={`principals[${index}].firstName`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.firstName || ''}
                              onChange={handleInputChange}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].lastName`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].lastName`}
                              name={`principals[${index}].lastName`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.lastName || ''}
                              onChange={handleInputChange}
                              placeholder="Enter last name"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].socialSecurityNumber`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              SSN <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].socialSecurityNumber`}
                              name={`principals[${index}].socialSecurityNumber`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.socialSecurityNumber || ''}
                              onChange={handleInputChange}
                              placeholder="Enter SSN"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].dateOfBirth`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id={`principals[${index}].dateOfBirth`}
                              name={`principals[${index}].dateOfBirth`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.dateOfBirth || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].title`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Title
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].title`}
                              name={`principals[${index}].title`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.title || ''}
                              onChange={handleInputChange}
                              placeholder="Enter title"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].equityOwnershipPercentage`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Ownership %
                            </label>
                            <input
                              type="number"
                              id={`principals[${index}].equityOwnershipPercentage`}
                              name={`principals[${index}].equityOwnershipPercentage`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.equityOwnershipPercentage || ''}
                              onChange={handleInputChange}
                              placeholder="%"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].street`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Street <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].street`}
                              name={`principals[${index}].street`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.street || ''}
                              onChange={handleInputChange}
                              placeholder="Enter street address"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].street2`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Street 2
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].street2`}
                              name={`principals[${index}].street2`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.street2 || ''}
                              onChange={handleInputChange}
                              placeholder="Enter street 2 (optional)"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].city`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].city`}
                              name={`principals[${index}].city`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.city || ''}
                              onChange={handleInputChange}
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].state`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              State <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].state`}
                              name={`principals[${index}].state`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.state || ''}
                              onChange={handleInputChange}
                              placeholder="Enter state"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].zipCode`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Zip Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].zipCode`}
                              name={`principals[${index}].zipCode`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.zipCode || ''}
                              onChange={handleInputChange}
                              placeholder="Enter zip code"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].phoneNumber`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].phoneNumber`}
                              name={`principals[${index}].phoneNumber`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.phoneNumber || ''}
                              onChange={handleInputChange}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].email`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              id={`principals[${index}].email`}
                              name={`principals[${index}].email`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.email || ''}
                              onChange={handleInputChange}
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>
                        <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].isPersonalGuarantor`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Personal Guarantor
                            </label>
                            <input
                              type="checkbox"
                              id={`principals[${index}].isPersonalGuarantor`}
                              name={`principals[${index}].isPersonalGuarantor`}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              checked={principal.isPersonalGuarantor || false}
                              onChange={(e) => {
                                const newPrincipals = [...formData.principals];
                                newPrincipals[index] = {
                                  ...newPrincipals[index],
                                  isPersonalGuarantor: e.target.checked
                                };
                                setFormData(prev => ({
                                  ...prev,
                                  principals: newPrincipals
                                }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].driverLicenseNumber`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Driver License Number
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].driverLicenseNumber`}
                              name={`principals[${index}].driverLicenseNumber`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.driverLicenseNumber || ''}
                              onChange={handleInputChange}
                              placeholder="Enter driver license number"
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].driverLicenseIssuedState`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Driver License State
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].driverLicenseIssuedState`}
                              name={`principals[${index}].driverLicenseIssuedState`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 hover:border-blue-400 transition-colors"
                              value={principal.driverLicenseIssuedState || ''}
                              onChange={handleInputChange}
                              placeholder="Enter driver license state"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                      onClick={() => addPrincipal()}
                    >
                      <span className="mr-2">➕</span>
                      Add Another Principal
                    </button>
                    <p className="text-gray-400 text-sm mt-2">
                      Add additional principals if there are multiple owners or controllers of the business
                    </p>
                  </div>
                  
                  <div className="mt-8 mb-6">
                    <div className="section-title text-xl font-bold text-white dark:text-white mb-4">
                      Additional Business Details
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label
                      htmlFor="statementDeliveryMethod"
                      className="block text-sm font-medium text-white dark:text-white mb-1"
                    >
                      Statement Delivery Method
                    </label>
                    <input
                      type="text"
                      id="statementDeliveryMethod"
                      name="statementDeliveryMethod"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      value={formData.statementDeliveryMethod || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Business Addresses
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.dba.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA Street
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.dba.street"
                          name="business.businessAddress.dba.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.dba?.street || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.dba.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA City
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.dba.city"
                          name="business.businessAddress.dba.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.dba?.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.dba.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA State
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.dba.state"
                          name="business.businessAddress.dba.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.dba?.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.dba.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA Zip
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.dba.zipCode"
                          name="business.businessAddress.dba.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.dba?.zipCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.corporate.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate Street
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.corporate.street"
                          name="business.businessAddress.corporate.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.corporate?.street || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.corporate.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate City
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.corporate.city"
                          name="business.businessAddress.corporate.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.corporate?.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.corporate.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate State
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.corporate.state"
                          name="business.businessAddress.corporate.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.corporate?.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.corporate.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate Zip
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.corporate.zipCode"
                          name="business.businessAddress.corporate.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.corporate?.zipCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.shipTo.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo Street
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.shipTo.street"
                          name="business.businessAddress.shipTo.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.shipTo?.street || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.shipTo.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo City
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.shipTo.city"
                          name="business.businessAddress.shipTo.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.shipTo?.city || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.shipTo.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >   
                          ShipTo State
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.shipTo.state"
                          name="business.businessAddress.shipTo.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.shipTo?.state || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.businessAddress.shipTo.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo Zip
                        </label>
                        <input
                          type="text"
                          id="business.businessAddress.shipTo.zipCode"
                          name="business.businessAddress.shipTo.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress?.shipTo?.zipCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Website Information
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.websites.0.url"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Website URL
                        </label>
                        <input
                          type="text"
                          id="business.websites.0.url"
                          name="business.websites.0.url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites?.[0]?.url || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.websites.0.websiteCustomerServiceEmail"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Customer Service Email
                        </label>
                        <input
                          type="email"
                          id="business.websites.0.websiteCustomerServiceEmail"
                          name="business.websites.0.websiteCustomerServiceEmail"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites?.[0]?.websiteCustomerServiceEmail || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.websites.0.websiteCustomerServicePhoneNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Customer Service Phone
                        </label>
                        <input
                          type="text"
                          id="business.websites.0.websiteCustomerServicePhoneNumber"
                          name="business.websites.0.websiteCustomerServicePhoneNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites?.[0]?.websiteCustomerServicePhoneNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      EBT Services
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business.ebt.ebtType"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          EBT Type
                        </label>
                        <input
                          type="text"
                          id="business.ebt.ebtType"
                          name="business.ebt.ebtType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.ebt?.ebtType || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business.ebt.ebtAccountNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          EBT Account Number
                        </label>
                        <input
                          type="text"
                          id="business.ebt.ebtAccountNumber"
                          name="business.ebt.ebtAccountNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.ebt?.ebtAccountNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Bank Account Information
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="bankAccount.abaRouting"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ABA Routing
                        </label>
                        <input
                          type="text"
                          id="bankAccount.abaRouting"
                          name="bankAccount.abaRouting"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.bankAccount?.abaRouting || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="bankAccount.accountType"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Account Type
                        </label>
                        <input
                          type="text"
                          id="bankAccount.accountType"
                          name="bankAccount.accountType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.bankAccount?.accountType || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="bankAccount.demandDepositAccount"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Demand Deposit Account
                        </label>
                        <input
                          type="text"
                          id="bankAccount.demandDepositAccount"
                          name="bankAccount.demandDepositAccount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.bankAccount?.demandDepositAccount || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8">
              <DocumentUpload
                externalKey={formData.externalKey}
                documents={documents}
                onDocumentUpdate={handleDocumentUpdate}
                bankVerificationRequired={bankVerificationRequired}
              />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-md font-medium ${currentStep === 1
                  ? 'bg-gray-200 text-white cursor-not-allowed'
                  : 'bg-gray-200 text-white hover:bg-gray-300'
                  }`}
              >
                ← Previous
              </button>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={saveForm}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-md font-medium flex items-center justify-center ${isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Application'
                    )}
                  </button>
                </div>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={submitForm}
                    className="px-6 py-3 bg-green-800 text-white rounded-md font-medium hover:bg-green-900 transition-colors"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MerchantForm;