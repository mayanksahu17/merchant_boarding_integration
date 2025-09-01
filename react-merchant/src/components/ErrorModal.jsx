import React from 'react';

const ErrorModal = ({ errors, onClose }) => {
  // Function to convert field names to user-friendly labels
  const getFieldLabel = (fieldName) => {
    // Handle principal fields with dynamic indices
    if (fieldName.startsWith('principals.')) {
      const match = fieldName.match(/principals\.(\d+)\.(.+)/);
      if (match) {
        const principalIndex = parseInt(match[1]) + 1;
        const field = match[2];
        const fieldLabels = {
          'firstName': 'First Name',
          'lastName': 'Last Name',
          'socialSecurityNumber': 'SSN',
          'dateOfBirth': 'Date of Birth',
          'phoneNumber': 'Phone',
          'email': 'Email',
          'street': 'Street',
          'city': 'City',
          'state': 'State',
          'zipCode': 'Zip Code',
          'title': 'Title',
          'equityOwnershipPercentage': 'Ownership Percentage',
          'isPersonalGuarantor': 'Personal Guarantor',
          'driverLicenseNumber': 'Driver License Number',
          'driverLicenseIssuedState': 'Driver License State'
        };
        return `Principal ${principalIndex} - ${fieldLabels[field] || field}`;
      }
    }
    
    const fieldLabels = {
      'business.businessType': 'Business Type',
      'business.federalTaxIdType': 'Federal Tax ID Type',
      'business.averageTicketAmount': 'Average Ticket Amount',
      'business.averageMonthlyVolume': 'Average Monthly Volume',
      'business.highTicketAmount': 'High Ticket Amount',
      'business.businessContact': 'Business Contact',
      'business.businessAddress': 'Business Address',
      'principals': 'Principals',
      'business.corporateName': 'Corporate Name',
      'business.dbaName': 'DBA Name',
      'business.federalTaxIdNumber': 'Federal Tax ID Number',
      'business.mcc': 'MCC',
      'business.phone': 'Business Phone',
      'business.email': 'Business Email',
      'business.merchandiseServicesSold': 'Merchandise/Services Sold',
      'business.percentOfBusinessTransactions': 'Business Transaction Percentages',
      'business.websites': 'Website Information',
      'business.ebt': 'EBT Services',
      'plan.planId': 'Plan ID',
      'plan.equipmentCostToMerchant': 'Equipment Cost',
      'plan.accountSetupFee': 'Setup Fee',
      'plan.discountFrequency': 'Discount Frequency',
      'shipping.shippingDestination': 'Shipping Destination',
      'shipping.deliveryMethod': 'Delivery Method',
      'bankAccount.abaRouting': 'ABA Routing Number',
      'bankAccount.accountType': 'Account Type',
      'bankAccount.demandDepositAccount': 'Account Number',
      'statementDeliveryMethod': 'Statement Delivery Method',
      'general': 'General Error'
    };
    
    return fieldLabels[fieldName] || fieldName;
  };

  // Function to format error messages
  const formatErrorMessage = (message) => {
    if (message.includes('should be string')) {
      return 'This field must contain text';
    } else if (message.includes('should be number')) {
      return 'This field must contain a number';
    } else if (message.includes('should be object')) {
      return 'This section must be completed';
    } else if (message.includes('should NOT have fewer than 1 items')) {
      return 'At least one principal must be added';
    } else if (message.includes('should be equal to one of the allowed values')) {
      // Extract the allowed values from the message
      const match = message.match(/\[ (.*) \]/);
      if (match) {
        const allowedValues = match[1].split(', ');
        return `Must be one of: ${allowedValues.join(', ')}`;
      }
      return message;
    } else if (message.includes('should NOT be empty')) {
      return 'This field cannot be empty';
    } else if (message.includes('should match')) {
      return 'This field format is invalid';
    } else if (message.includes('should be valid')) {
      return 'This field contains invalid data';
    } else if (message.includes('should be greater than')) {
      const match = message.match(/should be greater than (\d+)/);
      if (match) {
        return `Must be greater than ${match[1]}`;
      }
      return message;
    } else if (message.includes('should be less than')) {
      const match = message.match(/should be less than (\d+)/);
      if (match) {
        return `Must be less than ${match[1]}`;
      }
      return message;
    } else if (message.includes('should have length')) {
      const match = message.match(/should have length (\d+)/);
      if (match) {
        return `Must be exactly ${match[1]} characters long`;
      }
      return message;
    } else if (message.includes('should be a valid email')) {
      return 'Must be a valid email address';
    } else if (message.includes('should be a valid phone')) {
      return 'Must be a valid phone number';
    } else if (message.includes('should be a valid date')) {
      return 'Must be a valid date';
    }
    return message;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Validation Errors</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 p-4 bg-blue-900 border border-blue-700 rounded-md">
            <div className="flex items-center">
              <div className="text-blue-300 mr-2">ℹ️</div>
              <span className="text-blue-200 text-sm">
                Please fix the following validation errors before submitting your application. 
                All required fields must be completed with valid data.
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(errors).map(([field, messages]) => (
              <div key={field} className="bg-gray-700 p-4 rounded-lg border border-red-500 shadow-lg">
                <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  {getFieldLabel(field)}
                </h3>
                <ul className="space-y-2">
                  {Array.isArray(messages) ? messages.map((message, index) => (
                    <li key={index} className="text-red-300 flex items-start bg-gray-600 p-2 rounded">
                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm">{formatErrorMessage(message)}</span>
                    </li>
                  )) : (
                    <li className="text-red-300 flex items-start bg-gray-600 p-2 rounded">
                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                      <span className="text-sm">{formatErrorMessage(messages)}</span>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
