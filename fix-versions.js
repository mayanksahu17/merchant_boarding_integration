/**
 * Utility script to remove __v (version) fields from all application documents
 * Run this once to fix existing documents with version conflicts
 * 
 * Usage: node fix-versions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/application.model');

async function removeVersionFields() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://birlapranjal460:OSoLJzGoDlhPh5OT@ninexfoldmain.hb8fltn.mongodb.net/merchant", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Checking for documents with __v field...');
    const docsWithVersion = await Application.countDocuments({ __v: { $exists: true } });
    console.log(`Found ${docsWithVersion} documents with version field`);

    if (docsWithVersion === 0) {
      console.log('✅ No documents need fixing!');
      process.exit(0);
    }

    console.log('\n🔧 Removing __v field from all documents...');
    const result = await Application.updateMany(
      { __v: { $exists: true } },
      { $unset: { __v: "" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} documents`);
    console.log(`✅ Matched ${result.matchedCount} documents`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const remainingDocs = await Application.countDocuments({ __v: { $exists: true } });
    
    if (remainingDocs === 0) {
      console.log('✅ All version fields successfully removed!');
    } else {
      console.log(`⚠️ Warning: ${remainingDocs} documents still have __v field`);
    }

    console.log('\n✅ Done! You can now use the application without version conflicts.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
console.log('🚀 Starting version field removal script...\n');
removeVersionFields();


