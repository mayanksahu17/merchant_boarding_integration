import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import ProgressBar from '../components/ProgressBar';
import ThankYouMessage from '../components/ThankYouMessage';
import ErrorModal from '../components/ErrorModal';
import DocumentUpload from '../components/DocumentUpload';
import {
  getApplication,
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
  });

  const [showThankYou, setShowThankYou] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState(null);
  const [validationResponse, setValidationResponse] = useState(null);
  const [isExistingApplication, setIsExistingApplication] = useState(false);
  const [errors, setErrors] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [bankVerificationRequired, setBankVerificationRequired] = useState(false);

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
    const { name, value, type } = e.target;
    let processedValue = value;

    // Convert to number if the field is numeric
    if (type === 'number' || name.includes('plan.') || name.includes('equipment') || name.includes('percentOfBusinessTransactions') || name.includes('accountSetupFee') || name.includes('equipmentCostToMerchant')) {
      processedValue = value === '' ? '' : Number(value);
    }

    // Handle date fields
    if (type === 'date') {
      processedValue = value;
    }

    // Handle nested fields (e.g., plan.equipment[0].quantity)
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev) => {
        const newState = { ...prev };
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          const arrayMatch = keys[i].match(/(\w+)\[(\d+)\]/);
          if (arrayMatch) {
            const arrayName = arrayMatch[1];
            const arrayIndex = parseInt(arrayMatch[2]);
            if (!current[arrayName] || !Array.isArray(current[arrayName])) {
              current[arrayName] = [];
            }
            if (!current[arrayName][arrayIndex]) {
              current[arrayName][arrayIndex] = {};
            }
            current = current[arrayName][arrayIndex];
          } else {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
        }
        const lastKeyArrayMatch = keys[keys.length - 1].match(/(\w+)\[(\d+)\]/);
        if (lastKeyArrayMatch) {
          const arrayName = lastKeyArrayMatch[1];
          const arrayIndex = parseInt(lastKeyArrayMatch[2]);
          if (!current[arrayName] || !Array.isArray(current[arrayName])) {
            current[arrayName] = [];
          }
          current[arrayName][arrayIndex] = processedValue;
        } else {
          current[keys[keys.length - 1]] = processedValue;
        }
        return newState;
      });
    } else {
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
      if (data) {
        const appData = data.mongoApplication || data.paymentsHubResponse || data;
        setFormData(formatDatesInResponse(appData));
        setDocuments(appData.documents || []);
      }
    } catch (error) {
      console.error('Error loading application data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDatesInResponse = (data) => {
    if (!data) return data;

    const formatted = { ...data };

    if (formatted['business?']) {
      formatted.business = formatted['business?'];
      delete formatted['business?'];
    }

    if (formatted.principals && Array.isArray(formatted.principals)) {
      formatted.principals = formatted.principals.map((principal) => ({
        ...principal,
        dateOfBirth: formatDateForInput(principal.dateOfBirth),
      }));
    }

    if (formatted.business?.businessContact?.dateOfBirth) {
      formatted.business.businessContact.dateOfBirth = formatDateForInput(
        formatted.business.businessContact.dateOfBirth
      );
    }

    return formatted;
  };

  const saveForm = async () => {
    setIsLoading(true);
    setLoadingMessage('Saving application...');
    try {
      const dataToSend = { ...formData };
      if (dataToSend['business?']) {
        dataToSend.business = dataToSend['business?'];
        delete dataToSend['business?'];
      }

      const response = await updateApplication(dataToSend.externalKey, dataToSend);
      if (response?.mongoApplication?.externalKey) {
        setFormData((prev) => ({
          ...prev,
          externalKey: response.mongoApplication.externalKey,
        }));
        setIsExistingApplication(true);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      if (error.status === "error") {
        console.error('Validation errors:', error);
        setErrors(error.response.data?.errors || {});
      } else {
        setErrors({ general: ['Failed to save application. Please try again.', error.message] });
      }
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

  const submitForm = async () => {
    setIsLoading(true);
    setLoadingMessage('Validating application...');
    try {
      await saveForm();

      // Validate bank information
      const needsBankVerification = validateBankInfo();

      // Check if at least one bank verification document is uploaded
      const bankDocs = ['voided_check', 'bank_statement', 'processing_statement'];
      const hasBankDoc = documents.some(doc => bankDocs.includes(doc.type));

      if (needsBankVerification && !hasBankDoc) {
        throw new Error('Please upload at least one bank verification document (Voided check, Bank statement, or Processing statement)');
      }

      const validateData = await validateApplication(formData.externalKey);
      setValidationResponse(validateData);
      if (validateData) {
        setLoadingMessage('Submitting application...');
        const submitResponse = await submitToUnderwriting(formData.externalKey, formData);
        setSubmissionResponse(submitResponse);
        setShowThankYou(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: [error.message || 'Failed to submit application. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const externalKey = searchParams.get('key');
    if (externalKey) {
      setFormData((prev) => ({
        ...prev,
        externalKey,
      }));
      loadApplicationData(externalKey);
      setIsExistingApplication(true);
    } else {
      addPrincipal();
      addPrincipal();
    }
  }, [searchParams]);

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
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {errors && <ErrorModal errors={errors} onClose={() => setErrors(null)
      } />}
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
                        value={formData.agent}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.applicationName}
                        onChange={handleInputChange}
                        required
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
                        value={formData.externalKey}
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
                        value={formData.plan.planId}
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
                        value={formData.plan.equipmentCostToMerchant}
                        onChange={handleInputChange}
                        step="0.01"
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
                        value={formData.plan.accountSetupFee}
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
                        value={formData.plan.discountFrequency}
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
                              htmlFor="plan.equipment[0].equipmentId"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Equipment ID
                            </label>
                            <input
                              type="number"
                              id="plan.equipment[0].equipmentId"
                              name="plan.equipment[0].equipmentId"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.plan.equipment[0].equipmentId}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="plan.equipment[0].quantity"
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Quantity
                            </label>
                            <input
                              type="number"
                              id="plan.equipment[0].quantity"
                              name="plan.equipment[0].quantity"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={formData.plan.equipment[0].quantity}
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
                        htmlFor="shipping?.shippingDestination"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Shipping Destination
                      </label>
                      <input
                        type="text"
                        id="shipping?.shippingDestination"
                        name="shipping?.shippingDestination"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.shipping?.shippingDestination}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="shipping?.deliveryMethod"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Delivery Method
                      </label>
                      <input
                        type="text"
                        id="shipping?.deliveryMethod"
                        name="shipping?.deliveryMethod"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.shipping?.deliveryMethod}
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
                        htmlFor="business?.corporateName"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Corporate Name
                      </label>
                      <input
                        type="text"
                        id="business?.corporateName"
                        name="business?.corporateName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.corporateName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.dbaName"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        DBA Name
                      </label>
                      <input
                        type="text"
                        id="business?.dbaName"
                        name="business?.dbaName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.dbaName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.businessType"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Business Type
                      </label>
                      <input
                        type="text"
                        id="business?.businessType"
                        name="business?.businessType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.businessType}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.federalTaxIdNumber"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Federal Tax ID
                      </label>
                      <input
                        type="text"
                        id="business?.federalTaxIdNumber"
                        name="business?.federalTaxIdNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.federalTaxIdNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.federalTaxIdType"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Tax ID Type
                      </label>
                      <input
                        type="text"
                        id="business?.federalTaxIdType"
                        name="business?.federalTaxIdType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.federalTaxIdType}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.mcc"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        MCC
                      </label>
                      <input
                        type="text"
                        id="business?.mcc"
                        name="business?.mcc"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.mcc}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label
                        htmlFor="business?.phone"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        id="business?.phone"
                        name="business?.phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.email"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="business?.email"
                        name="business?.email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.averageTicketAmount"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Avg Ticket Amount
                      </label>
                      <input
                        type="number"
                        id="business?.averageTicketAmount"
                        name="business?.averageTicketAmount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.averageTicketAmount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.averageMonthlyVolume"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Avg Monthly Volume
                      </label>
                      <input
                        type="number"
                        id="business?.averageMonthlyVolume"
                        name="business?.averageMonthlyVolume"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.averageMonthlyVolume}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.highTicketAmount"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        High Ticket Amount
                      </label>
                      <input
                        type="number"
                        id="business?.highTicketAmount"
                        name="business?.highTicketAmount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.highTicketAmount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="business?.merchandiseServicesSold"
                        className="block text-sm font-medium text-white dark:text-white mb-1"
                      >
                        Merchandise/Services
                      </label>
                      <input
                        type="text"
                        id="business?.merchandiseServicesSold"
                        name="business?.merchandiseServicesSold"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData.business?.merchandiseServicesSold}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="array-section space-y-4">
                    <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                      Business Transaction Percentages
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business?.percentOfBusinessTransactions?.cardSwiped"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Card Swiped (%)
                        </label>
                        <input
                          type="number"
                          id="business?.percentOfBusinessTransactions?.cardSwiped"
                          name="business?.percentOfBusinessTransactions?.cardSwiped"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.percentOfBusinessTransactions?.cardSwiped}
                          onChange={handleInputChange}
                          placeholder="%"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Keyed Card Present (%)
                        </label>
                        <input
                          type="number"
                          id="business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted"
                          name="business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={
                            formData.business?.percentOfBusinessTransactions?.keyedCardPresentNotImprinted
                          }
                          onChange={handleInputChange}
                          placeholder="%"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.percentOfBusinessTransactions?.mailOrPhoneOrder"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Mail/Phone Order (%)
                        </label>
                        <input
                          type="number"
                          id="business?.percentOfBusinessTransactions?.mailOrPhoneOrder"
                          name="business?.percentOfBusinessTransactions?.mailOrPhoneOrder"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.percentOfBusinessTransactions?.mailOrPhoneOrder}
                          onChange={handleInputChange}
                          placeholder="%"
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.percentOfBusinessTransactions.internet"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Internet (%)
                        </label>
                        <input
                          type="number"
                          id="business?.percentOfBusinessTransactions.internet"
                          name="business?.percentOfBusinessTransactions.internet"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.percentOfBusinessTransactions?.internet}
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
                          htmlFor="business?.businessContact.firstName"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact.firstName"
                          name="business?.businessContact.firstName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.lastName"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.lastName"
                          name="business?.businessContact?.lastName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.socialSecurityNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          SSN
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.socialSecurityNumber"
                          name="business?.businessContact?.socialSecurityNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.socialSecurityNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.dateOfBirth"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          id="business?.businessContact?.dateOfBirth"
                          name="business?.businessContact?.dateOfBirth"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.dateOfBirth}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Street
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.street"
                          name="business?.businessContact?.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.street}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.street2"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Street 2
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.street2"
                          name="business?.businessContact?.street2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.street2}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Zip Code
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.zipCode"
                          name="business?.businessContact?.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.city"
                          name="business?.businessContact?.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          State
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.state"
                          name="business?.businessContact?.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.phoneNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Phone
                        </label>
                        <input
                          type="text"
                          id="business?.businessContact?.phoneNumber"
                          name="business?.businessContact?.phoneNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessContact?.email"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="business?.businessContact?.email"
                          name="business?.businessContact?.email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessContact?.email}
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
                  <div id="principalsContainer">
                    {formData.principals?.map((principal, index) => (
                      <div key={index} className="principal-section space-y-4">
                        <div className="array-section-title text-lg font-semibold text-white dark:text-white">
                          Principal {index + 1}
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                          onClick={() => removePrincipal(index)}
                        >
                          Remove
                        </button>
                        <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].firstName`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              First Name
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].firstName`}
                              name={`principals[${index}].firstName`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].lastName`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Last Name
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].lastName`}
                              name={`principals[${index}].lastName`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].socialSecurityNumber`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              SSN
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].socialSecurityNumber`}
                              name={`principals[${index}].socialSecurityNumber`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.socialSecurityNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].dateOfBirth`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              id={`principals[${index}].dateOfBirth`}
                              name={`principals[${index}].dateOfBirth`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.dateOfBirth}
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.title}
                              onChange={handleInputChange}
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.equityOwnershipPercentage}
                              onChange={handleInputChange}
                              placeholder="%"
                            />
                          </div>
                        </div>
                        <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].street`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Street
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].street`}
                              name={`principals[${index}].street`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.street}
                              onChange={handleInputChange}
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.street2}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].city`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              City
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].city`}
                              name={`principals[${index}].city`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].state`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              State
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].state`}
                              name={`principals[${index}].state`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.state}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].zipCode`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Zip Code
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].zipCode`}
                              name={`principals[${index}].zipCode`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.zipCode}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].phoneNumber`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              id={`principals[${index}].phoneNumber`}
                              name={`principals[${index}].phoneNumber`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor={`principals[${index}].email`}
                              className="block text-sm font-medium text-white dark:text-white mb-1"
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              id={`principals[${index}].email`}
                              name={`principals[${index}].email`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              value={principal.email}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => addPrincipal()}
                  >
                    ➕ Add Principal
                  </button>
                  <div className="form-group">
                    <label
                      htmlFor="business?.statementDeliveryMethod"
                      className="block text-sm font-medium text-white dark:text-white mb-1"
                    >
                      Statement Delivery Method
                    </label>
                    <input
                      type="text"
                      id="business?.statementDeliveryMethod"
                      name="business?.statementDeliveryMethod"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      value={formData.business?.statementDeliveryMethod}
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
                          htmlFor="business?.businessAddress.dba.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA Street
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.dba.street"
                          name="business?.businessAddress.dba.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.dba.street}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.dba.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA City
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.dba.city"
                          name="business?.businessAddress.dba.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.dba.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.dba.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA State
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.dba.state"
                          name="business?.businessAddress.dba.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.dba.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.dba.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          DBA Zip
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.dba.zipCode"
                          name="business?.businessAddress.dba.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.dba.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.corporate.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate Street
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.corporate.street"
                          name="business?.businessAddress.corporate.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.corporate.street}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.corporate.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate City
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.corporate.city"
                          name="business?.businessAddress.corporate.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.corporate.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.corporate.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate State
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.corporate.state"
                          name="business?.businessAddress.corporate.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.corporate.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.corporate.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Corporate Zip
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.corporate.zipCode"
                          name="business?.businessAddress.corporate.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.corporate.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.shipTo.street"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo Street
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.shipTo.street"
                          name="business?.businessAddress.shipTo.street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.shipTo.street}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.shipTo.city"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo City
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.shipTo.city"
                          name="business?.businessAddress.shipTo.city"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.shipTo.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.shipTo.state"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo State
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.shipTo.state"
                          name="business?.businessAddress.shipTo.state"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.shipTo.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.businessAddress.shipTo.zipCode"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          ShipTo Zip
                        </label>
                        <input
                          type="text"
                          id="business?.businessAddress.shipTo.zipCode"
                          name="business?.businessAddress.shipTo.zipCode"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.businessAddress.shipTo.zipCode}
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
                          htmlFor="business?.websites[0].url"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Website URL
                        </label>
                        <input
                          type="text"
                          id="business?.websites[0].url"
                          name="business?.websites[0].url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites[0].url}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.websites[0].websiteCustomerServiceEmail"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Customer Service Email
                        </label>
                        <input
                          type="email"
                          id="business?.websites[0].websiteCustomerServiceEmail"
                          name="business?.websites[0].websiteCustomerServiceEmail"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites[0].websiteCustomerServiceEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.websites[0].websiteCustomerServicePhoneNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          Customer Service Phone
                        </label>
                        <input
                          type="text"
                          id="business?.websites[0].websiteCustomerServicePhoneNumber"
                          name="business?.websites[0].websiteCustomerServicePhoneNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.websites[0].websiteCustomerServicePhoneNumber}
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
                          htmlFor="business?.ebt?.ebtType"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          EBT Type
                        </label>
                        <input
                          type="text"
                          id="business?.ebt?.ebtType"
                          name="business?.ebt?.ebtType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.ebt?.ebtType}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="business?.ebt?.ebtAccountNumber"
                          className="block text-sm font-medium text-white dark:text-white mb-1"
                        >
                          EBT Account Number
                        </label>
                        <input
                          type="text"
                          id="business?.ebt?.ebtAccountNumber"
                          name="business?.ebt?.ebtAccountNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          value={formData.business?.ebt?.ebtAccountNumber}
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
                          value={formData.bankAccount?.abaRouting}
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
                          value={formData.bankAccount?.accountType}
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
                          value={formData.bankAccount?.demandDepositAccount}
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
    </div>
  );
};

export default MerchantForm;
