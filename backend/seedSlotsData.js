import mongoose from 'mongoose';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/barber-suite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const createSlotData = (day) => {
  // Helper to create a slot array with a single available slot at a given time
  const makeSlot = (hour, minute) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return [{
      name: "Available",
      starting_time: new Date(date),
      ending_time: new Date(date)
    }];
  };
  return {
    day: day,
    morning: makeSlot(9, 0),
    afternoon: makeSlot(12, 0),
    evening: makeSlot(14, 30)
  };
};

const seedSlotsData = async () => {
  try {
    // Clear existing data
    await Slots.deleteMany({});
    await Slots1.deleteMany({});
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slotsData = days.map(day => createSlotData(day));
    
    // Insert data into both models
    await Slots.insertMany(slotsData);
    await Slots1.insertMany(slotsData);
    
    console.log('✅ Slots data seeded successfully!');
    console.log('📅 Added schedule for:', days.join(', '));
    console.log('⏰ Time slots: Morning (9:00 AM), Afternoon (12:00 PM), Evening (2:30 PM)');
    
    // Display the seeded data
    const allSlots = await Slots.find({});
    console.log('\n📋 Seeded Data:');
    allSlots.forEach(slot => {
      console.log(`${slot.day}:`);
      console.log(`  Morning: ${slot.morning[0].starting_time.toLocaleTimeString()}`);
      console.log(`  Afternoon: ${slot.afternoon[0].starting_time.toLocaleTimeString()}`);
      console.log(`  Evening: ${slot.evening[0].starting_time.toLocaleTimeString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding slots data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedSlotsData(); 