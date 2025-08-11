import mongoose from 'mongoose';
import Services from './models/services.js';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';

const checkServicesAndSlots = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/barber');
    
    console.log('🔍 CHECKING SERVICE DURATIONS:');
    
    const services = await Services.find();
    
    console.log('\n📋 ALL SERVICES:');
    services.forEach(service => {
      const minutes = parseInt(service.time.split(' ')[0]);
      console.log(`${service.name} (${service.gender}): ${minutes} minutes - ${service.time}`);
    });
    
    console.log('\n🔍 CHECKING SLOT DURATIONS:');
    
    const maleSlots = await Slots.findOne({ day: 'Monday' });
    const femaleSlots = await Slots1.findOne({ day: 'Monday' });
    
    console.log('\n📅 MALE SLOTS (Monday):');
    if (maleSlots) {
      const morningDuration = (new Date(maleSlots.morning[0].ending_time) - new Date(maleSlots.morning[0].starting_time)) / (1000 * 60);
      const afternoonDuration = (new Date(maleSlots.afternoon[0].ending_time) - new Date(maleSlots.afternoon[0].starting_time)) / (1000 * 60);
      const eveningDuration = (new Date(maleSlots.evening[0].ending_time) - new Date(maleSlots.evening[0].starting_time)) / (1000 * 60);
      
      console.log(`Morning: ${morningDuration} minutes (${maleSlots.morning[0].starting_time} to ${maleSlots.morning[0].ending_time})`);
      console.log(`Afternoon: ${afternoonDuration} minutes (${maleSlots.afternoon[0].starting_time} to ${maleSlots.afternoon[0].ending_time})`);
      console.log(`Evening: ${eveningDuration} minutes (${maleSlots.evening[0].starting_time} to ${maleSlots.evening[0].ending_time})`);
    }
    
    console.log('\n📅 FEMALE SLOTS (Monday):');
    if (femaleSlots) {
      const morningDuration = (new Date(femaleSlots.morning[0].ending_time) - new Date(femaleSlots.morning[0].starting_time)) / (1000 * 60);
      const afternoonDuration = (new Date(femaleSlots.afternoon[0].ending_time) - new Date(femaleSlots.afternoon[0].starting_time)) / (1000 * 60);
      const eveningDuration = (new Date(femaleSlots.evening[0].ending_time) - new Date(femaleSlots.evening[0].starting_time)) / (1000 * 60);
      
      console.log(`Morning: ${morningDuration} minutes (${femaleSlots.morning[0].starting_time} to ${femaleSlots.morning[0].ending_time})`);
      console.log(`Afternoon: ${afternoonDuration} minutes (${femaleSlots.afternoon[0].starting_time} to ${femaleSlots.afternoon[0].ending_time})`);
      console.log(`Evening: ${eveningDuration} minutes (${femaleSlots.evening[0].starting_time} to ${femaleSlots.evening[0].ending_time})`);
    }
    
    console.log('\n🚨 POTENTIAL ISSUES:');
    console.log('If afternoon slot is only 90 minutes but you select services totaling more than 90 minutes,');
    console.log('the system should reject the booking, not allow it.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkServicesAndSlots();
