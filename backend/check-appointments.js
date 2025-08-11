import mongoose from 'mongoose';
import Appointment from './models/appointments.js';

const checkAppointments = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/barber');
    console.log('✅ Connected to MongoDB');
    
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    console.log(`\n📅 Total Appointments: ${appointments.length}`);
    
    if (appointments.length > 0) {
      console.log('\n📋 All Appointments:');
      appointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. ${apt.customerName} (${apt.customerPhone})`);
        console.log(`   📅 ${apt.day} ${apt.timeSlot}`);
        console.log(`   ⏰ ${apt.startTime.toLocaleString()} - ${apt.endTime.toLocaleString()}`);
        console.log(`   👤 Gender: ${apt.gender}`);
        console.log(`   🎯 Status: ${apt.status}`);
        console.log(`   🆔 ID: ${apt._id}`);
        console.log(`   📝 Created: ${apt.createdAt?.toLocaleString() || 'N/A'}`);
      });
    } else {
      console.log('❌ No appointments found');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAppointments();
