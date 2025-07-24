const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['voided_check', 'bank_statement', 'processing_statement']
  },
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  originalName: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const principalSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  socialSecurityNumber: String,
  dateOfBirth: Date,
  phoneNumber: String,
  email: String,
  street: String,
  street2: String,
  zipCode: String,
  city: String,
  state: String,
  equityOwnershipPercentage: Number,
  title: String,
  isPersonalGuarantor: Boolean,
  driverLicenseNumber: String,
  driverLicenseIssuedState: String
});

const websiteSchema = new mongoose.Schema({
  url: String,
  websiteCustomerServiceEmail: String,
  websiteCustomerServicePhoneNumber: String
});

const percentOfBusinessTransactionsSchema = new mongoose.Schema({
  cardSwiped: Number,
  keyedCardPresentNotImprinted: Number,
  mailOrPhoneOrder: Number,
  internet: Number
});

const businessContactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  socialSecurityNumber: String,
  dateOfBirth: Date,
  street: String,
  street2: String,
  zipCode: String,
  city: String,
  state: String,
  phoneNumber: String,
  email: String
});

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String
});

const ebtSchema = new mongoose.Schema({
  ebtType: String,
  ebtAccountNumber: String
});

const businessServicesRequestedSchema = new mongoose.Schema({
  ebt: [ebtSchema]
});

const businessSchema = new mongoose.Schema({
  corporateName: String,
  dbaName: String,
  businessType: String,
  federalTaxIdNumber: String,
  federalTaxIdType: String,
  mcc: String,
  phone: String,
  email: String,
  ebt: String,
  websites: [websiteSchema],
  averageTicketAmount: Number,
  averageMonthlyVolume: Number,
  highTicketAmount: Number,
  merchandiseServicesSold: String,
  percentOfBusinessTransactions: percentOfBusinessTransactionsSchema,
  businessContact: businessContactSchema,
  statementDeliveryMethod: String,
  businessAddress: {
    dba: addressSchema,
    corporate: addressSchema,
    shipTo: addressSchema
  },
  businessServicesRequested: [businessServicesRequestedSchema]
});

const equipmentSchema = new mongoose.Schema({
  equipmentId: Number,
  quantity: Number
});

const planSchema = new mongoose.Schema({
  planId: Number,
  equipmentCostToMerchant: Number,
  accountSetupFee: Number,
  discountFrequency: String,
  equipment: [equipmentSchema]
});

const shippingSchema = new mongoose.Schema({
  shippingDestination: String,
  deliveryMethod: String
});

const bankAccountSchema = new mongoose.Schema({
  abaRouting: String,
  accountType: String,
  demandDepositAccount: String
});

const applicationSchema = new mongoose.Schema({
  agent: Number,
  applicationName: String,
  externalKey: { type: String, unique: true },
  plan: planSchema,
  shipping: shippingSchema,
  principals: [principalSchema],
  business: businessSchema,
  bankAccount: bankAccountSchema,
  documents: [documentSchema],
  merchantLink: String,  // Add merchantLink field
  status: { type: String, default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Only validate if status is being changed to 'submitted_to_underwriting'
  if (this.isModified('status') && this.status === 'submitted_to_underwriting') {
    const hasBankDocument = this.documents.some(doc => 
      ['voided_check', 'bank_statement', 'processing_statement'].includes(doc.type)
    );

    if (!hasBankDocument) {
      next(new Error('At least one bank verification document (voided check, bank statement, or processing statement) is required'));
      return;
    }
  }

  next();
});

applicationSchema.methods.validateBankDocuments = function() {
  const hasBankDocument = this.documents.some(doc => 
    ['voided_check', 'bank_statement', 'processing_statement'].includes(doc.type)
  );

  if (!hasBankDocument) {
    throw new Error('At least one bank verification document (voided check, bank statement, or processing statement) is required');
  }

  return true;
};

module.exports = mongoose.model('Application', applicationSchema);