const mongoose = require('mongoose');

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
  status: { type: String, default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', applicationSchema);