import mongoose from 'mongoose';
import Services from './models/services.js';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';
import Appointment from './models/appointments.js';
import Customer from './models/customers.js';
import Barber from './models/barber.js';

// Database connection strings from your project
const DB_CONNECTIONS = {
  'barber-suite': 'mongodb://localhost:27017/barber-suite',
  'barber': 'mongodb://localhost:27017/barber'
};

const checkDatabase = async (dbName, connectionString) => {
  try {
    console.log(`\n🔍 Checking database: ${dbName}`);
    console.log(`📍 Connection string: ${connectionString}`);
    
    await mongoose.connect(connectionString);
    console.log(`✅ Connected to ${dbName} successfully`);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Total collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log(`📋 Collections found:`);
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documents`);
      }
    } else {
      console.log(`❌ No collections found in ${dbName}`);
    }
    
    // Check specific models if they exist
    const modelChecks = [
      { name: 'Services', model: Services },
      { name: 'Slots (Schedule)', model: Slots },
      { name: 'Slots1', model: Slots1 },
      { name: 'Appointments', model: Appointment },
      { name: 'Customers', model: Customer },
      { name: 'Barbers', model: Barber }
    ];
    
    console.log(`\n📈 Model-specific counts:`);
    for (const { name, model } of modelChecks) {
      try {
        const count = await model.countDocuments();
        console.log(`   • ${name}: ${count} documents`);
        
        if (count > 0 && count <= 5) {
          console.log(`     Sample data:`);
          const samples = await model.find().limit(2).lean();
          samples.forEach((doc, index) => {
            console.log(`       ${index + 1}. ${JSON.stringify(doc, null, 2).substring(0, 100)}...`);
          });
        }
      } catch (error) {
        console.log(`   • ${name}: Error - ${error.message}`);
      }
    }
    
    await mongoose.disconnect();
    return { dbName, connected: true, collections: collections.length };
    
  } catch (error) {
    console.log(`❌ Failed to connect to ${dbName}: ${error.message}`);
    return { dbName, connected: false, error: error.message };
  }
};

const main = async () => {
  console.log(`🗄️  DATABASE STATUS REPORT`);
  console.log(`=========================`);
  
  const results = [];
  
  for (const [dbName, connectionString] of Object.entries(DB_CONNECTIONS)) {
    const result = await checkDatabase(dbName, connectionString);
    results.push(result);
  }
  
  console.log(`\n📊 SUMMARY`);
  console.log(`==========`);
  results.forEach(result => {
    if (result.connected) {
      console.log(`✅ ${result.dbName}: Connected (${result.collections} collections)`);
    } else {
      console.log(`❌ ${result.dbName}: Failed - ${result.error}`);
    }
  });
  
  console.log(`\n🎯 CURRENT SETUP:`);
  console.log(`• You have ${results.filter(r => r.connected).length} accessible database(s)`);
  console.log(`• Your app is currently using: simple-api.js (mock data) OR api.js (MongoDB)`);
  console.log(`• Booking data flow depends on which server you're running`);
  
  process.exit(0);
};

main().catch(console.error);
