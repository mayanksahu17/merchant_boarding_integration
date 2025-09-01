const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8000/api';
const TEST_EXTERNAL_KEY = 'EXT2712925053786'; // Replace with your actual external key

// Test functions
async function testGetApplication() {
  console.log('\n🔍 Testing GET /applications/:externalKey');
  try {
    const response = await axios.get(`${BASE_URL}/applications/${TEST_EXTERNAL_KEY}`);
    console.log('✅ GET Application - Success');
    console.log('📊 Response status:', response.data.status);
    console.log('📊 Has MongoDB data:', !!response.data.mongoApplication);
    console.log('📊 Has PaymentsHub data:', !!response.data.paymentsHubResponse);
    
    if (response.data.mongoApplication) {
      const mongo = response.data.mongoApplication;
      console.log('📊 MongoDB data summary:');
      console.log('  - Business:', !!mongo.business);
      console.log('  - Principals:', mongo.principals ? mongo.principals.length : 0);
      console.log('  - Plan:', !!mongo.plan);
      console.log('  - Bank Account:', !!mongo.bankAccount);
      console.log('  - Shipping:', !!mongo.shipping);
      console.log('  - Statement Delivery:', !!mongo.statementDeliveryMethod);
    }
    
    return response.data;
  } catch (error) {
    console.log('❌ GET Application - Failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetDataSummary() {
  console.log('\n📊 Testing GET /applications/:externalKey/data-summary');
  try {
    const response = await axios.get(`${BASE_URL}/applications/${TEST_EXTERNAL_KEY}/data-summary`);
    console.log('✅ GET Data Summary - Success');
    console.log('📊 Data completeness:', response.data.dataSummary?.dataCompleteness);
    return response.data;
  } catch (error) {
    console.log('❌ GET Data Summary - Failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testSaveApplication() {
  console.log('\n💾 Testing POST /applications/:externalKey/save');
  try {
    const testData = {
      applicationName: 'Test Application',
      business: {
        corporateName: 'Test Corp',
        dbaName: 'Test DBA',
        businessType: 'Corporation',
        federalTaxIdNumber: '123456789',
        federalTaxIdType: 'EIN',
        mcc: '5411',
        phone: '555-1234',
        email: 'test@example.com',
        averageTicketAmount: 100,
        averageMonthlyVolume: 10000,
        highTicketAmount: 500,
        merchandiseServicesSold: 'Test Products',
        percentOfBusinessTransactions: {
          cardSwiped: 60,
          keyedCardPresentNotImprinted: 20,
          mailOrPhoneOrder: 15,
          internet: 5
        },
        businessContact: {
          firstName: 'John',
          lastName: 'Doe',
          socialSecurityNumber: '123-45-6789',
          dateOfBirth: '1980-01-01',
          street: '123 Test St',
          street2: 'Suite 100',
          zipCode: '12345',
          city: 'Test City',
          state: 'CA',
          phoneNumber: '555-1234',
          email: 'john@example.com'
        },
        businessAddress: {
          dba: { street: '123 DBA St', city: 'DBA City', state: 'CA', zipCode: '12345' },
          corporate: { street: '123 Corp St', city: 'Corp City', state: 'CA', zipCode: '12345' },
          shipTo: { street: '123 Ship St', city: 'Ship City', state: 'CA', zipCode: '12345' }
        },
        websites: [{ url: 'https://test.com', websiteCustomerServiceEmail: 'service@test.com', websiteCustomerServicePhoneNumber: '555-1234' }],
        ebt: { ebtType: 'SNAP', ebtAccountNumber: '123456789' }
      },
      plan: {
        planId: 115593,
        equipmentCostToMerchant: 299,
        accountSetupFee: 99,
        discountFrequency: 'Daily',
        equipment: [{ equipmentId: 1155, quantity: 1 }]
      },
      shipping: {
        shippingDestination: 'DBA',
        deliveryMethod: 'Ground'
      },
      principals: [
        {
          firstName: 'John',
          lastName: 'Doe',
          socialSecurityNumber: '123-45-6789',
          dateOfBirth: '1980-01-01',
          phoneNumber: '555-1234',
          email: 'john@example.com',
          street: '123 Test St',
          street2: 'Suite 100',
          zipCode: '12345',
          city: 'Test City',
          state: 'CA',
          equityOwnershipPercentage: 100,
          title: 'CEO',
          isPersonalGuarantor: true,
          driverLicenseNumber: 'DL123456',
          driverLicenseIssuedState: 'CA'
        }
      ],
      bankAccount: {
        abaRouting: '123456789',
        accountType: 'checking',
        demandDepositAccount: '987654321'
      },
      statementDeliveryMethod: 'electronic',
      // Add missing fields
      agent: 96194,
      applicationEmail: 'test@example.com',
      status: 'draft',
      documents: []
    };

    const response = await axios.post(`${BASE_URL}/applications/${TEST_EXTERNAL_KEY}/save`, testData);
    console.log('✅ Save Application - Success');
    console.log('📊 Response status:', response.data.status);
    console.log('📊 Message:', response.data.message);
    return response.data;
  } catch (error) {
    console.log('❌ Save Application - Failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 Testing with external key: ${TEST_EXTERNAL_KEY}`);
  
  // Test 1: Get application data
  const appData = await testGetApplication();
  
  // Test 2: Get data summary
  const summaryData = await testGetDataSummary();
  
  // Test 3: Save application data
  const saveData = await testSaveApplication();
  
  // Test 4: Verify data was saved by getting it again
  if (saveData?.status === 'success') {
    console.log('\n🔄 Verifying saved data...');
    await testGetApplication();
  }
  
  console.log('\n✨ API Tests Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testGetApplication, testGetDataSummary, testSaveApplication }; 