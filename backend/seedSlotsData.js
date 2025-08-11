import mongoose from 'mongoose';
import Slots, { dummyData as slotsDummyData } from './models/slots.js';
import Slots1, { dummyData as slots1DummyData } from './models/slots1.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/barber-suite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const seedSlotsData = async () => {
  try {
    // Clear existing data
    await Slots.deleteMany({});
    await Slots1.deleteMany({});

    // Insert dummy data into both models
    await Slots.insertMany(slotsDummyData);
    await Slots1.insertMany(slots1DummyData);

    console.log('✅ Slots data seeded successfully with dummy bookings!');
    console.log('📅 Added schedule for: Monday, Tuesday, Wednesday, Thursday, Friday');
    console.log('⏰ Each day has bookings in Morning, Afternoon, and Evening slots');

    // Display the seeded data
    const allSlots = await Slots.find({});
    const allSlots1 = await Slots1.find({});

    console.log('\n📋 Seeded Data for Slots (Schedule):');
    allSlots.forEach(slot => {
      console.log(`${slot.day}:`);
      console.log(`  Morning: ${slot.morning[0].name} (${slot.morning[0].starting_time.toLocaleTimeString()} - ${slot.morning[0].ending_time.toLocaleTimeString()})`);
      console.log(`  Afternoon: ${slot.afternoon[0].name} (${slot.afternoon[0].starting_time.toLocaleTimeString()} - ${slot.afternoon[0].ending_time.toLocaleTimeString()})`);
      console.log(`  Evening: ${slot.evening[0].name} (${slot.evening[0].starting_time.toLocaleTimeString()} - ${slot.evening[0].ending_time.toLocaleTimeString()})`);
    });

    console.log('\n📋 Seeded Data for Slots1:');
    allSlots1.forEach(slot => {
      console.log(`${slot.day}:`);
      console.log(`  Morning: ${slot.morning[0].name} (${slot.morning[0].starting_time.toLocaleTimeString()} - ${slot.morning[0].ending_time.toLocaleTimeString()})`);
      console.log(`  Afternoon: ${slot.afternoon[0].name} (${slot.afternoon[0].starting_time.toLocaleTimeString()} - ${slot.afternoon[0].ending_time.toLocaleTimeString()})`);
      console.log(`  Evening: ${slot.evening[0].name} (${slot.evening[0].starting_time.toLocaleTimeString()} - ${slot.evening[0].ending_time.toLocaleTimeString()})`);
    });

  } catch (error) {
    console.error('❌ Error seeding slots data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedSlotsData(); 