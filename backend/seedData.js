import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

// Configure dotenv
dotenv.config();

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models
import Services from './models/services.js';
import Barber from './models/barber.js';
import Customer from './models/customers.js';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';
import Appointment from './models/appointments.js';

// Dummy data for Services
const dummyServices = [
  {
    name: "Classic Haircut",
    cost: "$25",
    time: "30 minutes",
    gender: "male"
  },
  {
    name: "Beard Trim",
    cost: "$15",
    time: "20 minutes",
    gender: "male"
  },
  {
    name: "Hot Towel Shave",
    cost: "$35",
    time: "45 minutes",
    gender: "male"
  },
  {
    name: "Express Service",
    cost: "$20",
    time: "15 minutes",
    gender: "male"
  },
  {
    name: "Haircut & Beard Trim",
    cost: "$35",
    time: "45 minutes",
    gender: "male"
  },
  {
    name: "Kids Haircut",
    cost: "$18",
    time: "25 minutes",
    gender: "male"
  },
  {
    name: "Senior Haircut",
    cost: "$22",
    time: "30 minutes",
    gender: "male"
  },
  {
    name: "Style Consultation",
    cost: "$10",
    time: "15 minutes",
    gender: "male"
  },
  {
    name: "Women's Haircut",
    cost: "$30",
    time: "45 minutes",
    gender: "female"
  },
  {
    name: "Women's Hair Styling",
    cost: "$40",
    time: "60 minutes",
    gender: "female"
  },
  {
    name: "Women's Hair Coloring",
    cost: "$80",
    time: "120 minutes",
    gender: "female"
  },
  {
    name: "Women's Hair Treatment",
    cost: "$50",
    time: "90 minutes",
    gender: "female"
  }
];

// Function to create dummy barbers with hashed passwords
const createDummyBarbers = async () => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("password123", saltRounds);
  
  return [
    {
      name: "John Smith",
      email: "john.smith@barbersuite.com",
      phonenumber: "+1-555-0101",
      password: hashedPassword
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@barbersuite.com",
      phonenumber: "+1-555-0102",
      password: hashedPassword
    },
    {
      name: "David Wilson",
      email: "david.wilson@barbersuite.com",
      phonenumber: "+1-555-0103",
      password: hashedPassword
    },
    {
      name: "Robert Brown",
      email: "robert.brown@barbersuite.com",
      phonenumber: "+1-555-0104",
      password: hashedPassword
    }
  ];
};

// Function to create dummy customers with hashed passwords
const createDummyCustomers = async () => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("password123", saltRounds);
  
  return [
    {
      name: "Test User",
      enrollment_number: "EN000",
      course: "Test Course",
      year: "2024",
      email: "test@example.com",
      gender: "Male",
      phone_number: "+1-555-0000",
      password: hashedPassword
    },
    {
      name: "Alex Thompson",
      enrollment_number: "EN001",
      course: "Computer Science",
      year: "2023",
      email: "alex.thompson@email.com",
      gender: "Male",
      phone_number: "+1-555-1001",
      password: hashedPassword
    },
    {
      name: "Sarah Davis",
      enrollment_number: "EN002",
      course: "Business Administration",
      year: "2022",
      email: "sarah.davis@email.com",
      gender: "Female",
      phone_number: "+1-555-1002",
      password: hashedPassword
    },
    {
      name: "Michael Chen",
      enrollment_number: "EN003",
      course: "Engineering",
      year: "2024",
      email: "michael.chen@email.com",
      gender: "Male",
      phone_number: "+1-555-1003",
      password: hashedPassword
    },
    {
      name: "Emily Rodriguez",
      enrollment_number: "EN004",
      course: "Arts & Design",
      year: "2023",
      email: "emily.rodriguez@email.com",
      gender: "Female",
      phone_number: "+1-555-1004",
      password: hashedPassword
    },
    {
      name: "James Wilson",
      enrollment_number: "EN005",
      course: "Medicine",
      year: "2022",
      email: "james.wilson@email.com",
      gender: "Male",
      phone_number: "+1-555-1005",
      password: hashedPassword
    }
  ];
};

// Deterministic Mon–Fri slots
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const makeSlotRange = (sh, sm, eh, em) => [{
  name: 'Available',
  starting_time: new Date(2000, 0, 1, sh, sm),
  ending_time: new Date(2000, 0, 1, eh, em)
}];
const slotsForWeek = weekDays.map(day => ({
  day,
  morning: makeSlotRange(9, 0, 12, 0),
  afternoon: makeSlotRange(12, 0, 13, 30),
  evening: makeSlotRange(14, 30, 18, 0)
}));

// Function to seed all dummy data
const seedAllData = async () => {
  try {
    console.log('Starting to seed dummy data...');

    // Seed Services - Force update to include gender field
    const existingServices = await Services.countDocuments();
    if (existingServices === 0) {
      await Services.insertMany(dummyServices);
      console.log('✅ Services data seeded successfully');
    } else {
      // Clear and reseed services to include gender field
      await Services.deleteMany({});
      await Services.insertMany(dummyServices);
      console.log('✅ Services data updated with gender field');
    }

    // Seed Barbers
    const existingBarbers = await Barber.countDocuments();
    if (existingBarbers === 0) {
      const dummyBarbers = await createDummyBarbers();
      await Barber.insertMany(dummyBarbers);
      console.log('✅ Barbers data seeded successfully');
    } else {
      console.log('⏭️  Barbers data already exists, skipping...');
    }

    // Seed Customers
    const existingCustomers = await Customer.countDocuments();
    if (existingCustomers === 0) {
      const dummyCustomers = await createDummyCustomers();
      await Customer.insertMany(dummyCustomers);
      console.log('✅ Customers data seeded successfully');
    } else {
      console.log('⏭️  Customers data already exists, skipping...');
    }

    // Seed Slots for male
    const existingSlots = await Slots.countDocuments();
    if (existingSlots === 0) {
      await Slots.insertMany(slotsForWeek);
      console.log('✅ Slots (male) seeded successfully');
    } else {
      console.log('⏭️  Slots (male) already exist, skipping...');
    }

    // Seed Slots1 for female
    const existingSlots1 = await Slots1.countDocuments();
    if (existingSlots1 === 0) {
      await Slots1.insertMany(slotsForWeek);
      console.log('✅ Slots1 (female) seeded successfully');
    } else {
      console.log('⏭️  Slots1 (female) already exist, skipping...');
    }

    // Seed a few pre-booked appointments to simulate conflicts (leave plenty of room available)
    const existingAppts = await Appointment.countDocuments();
    if (existingAppts === 0) {
      const sample = [
        // Monday morning 9:00–9:30
        {
          customerName: 'Demo User 1', customerPhone: '+1-555-1111', gender: 'male',
          day: 'Monday', timeSlot: 'morning',
          startTime: new Date(2000, 0, 3, 9, 0), endTime: new Date(2000, 0, 3, 9, 30), services: []
        },
        // Tuesday afternoon 12:00–12:45
        {
          customerName: 'Demo User 2', customerPhone: '+1-555-2222', gender: 'female',
          day: 'Tuesday', timeSlot: 'afternoon',
          startTime: new Date(2000, 0, 4, 12, 0), endTime: new Date(2000, 0, 4, 12, 45), services: []
        },
        // Wednesday evening 16:00–16:30 (4:00 pm)
        {
          customerName: 'Demo User 3', customerPhone: '+1-555-3333', gender: 'male',
          day: 'Wednesday', timeSlot: 'evening',
          startTime: new Date(2000, 0, 5, 16, 0), endTime: new Date(2000, 0, 5, 16, 30), services: []
        }
      ];
      await Appointment.insertMany(sample);
      console.log('✅ Sample appointments seeded');
    } else {
      console.log('⏭️  Appointments already exist, skipping...');
    }

    console.log('🎉 All dummy data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Function to clear all data (for testing purposes)
const clearAllData = async () => {
  try {
    console.log('Clearing all data...');
    await Services.deleteMany({});
    await Barber.deleteMany({});
    await Customer.deleteMany({});
    await Slots.deleteMany({});
    console.log('✅ All data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Main function to handle command line arguments
const main = async () => {
  try {
    // Check if this is being run directly (not imported)
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      // MongoDB Connection
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barber';
      
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB successfully');

      // Check command line arguments
      const args = process.argv.slice(2);
      
      if (args.includes('--clear')) {
        // Clear all data
        await clearAllData();
      } else {
        // Seed all data
        await seedAllData();
      }

      console.log('Operation completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run main function if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  seedAllData,
  clearAllData,
  dummyServices,
  createDummyBarbers,
  createDummyCustomers
}; 