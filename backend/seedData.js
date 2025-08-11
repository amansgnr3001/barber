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

// Dummy data for Slots
const dummySlots = [
  {
    days: "Monday",
    bookings: [
      {
        starting_data: "2024-01-15T10:00:00.000Z",
        ending_data: "2024-01-15T10:30:00.000Z"
      },
      {
        starting_data: "2024-01-15T14:00:00.000Z",
        ending_data: "2024-01-15T14:45:00.000Z"
      }
    ]
  },
  {
    days: "Tuesday",
    bookings: [
      {
        starting_data: "2024-01-16T11:00:00.000Z",
        ending_data: "2024-01-16T11:30:00.000Z"
      },
      {
        starting_data: "2024-01-16T15:00:00.000Z",
        ending_data: "2024-01-16T15:20:00.000Z"
      }
    ]
  },
  {
    days: "Wednesday",
    bookings: [
      {
        starting_data: "2024-01-17T10:30:00.000Z",
        ending_data: "2024-01-17T11:00:00.000Z"
      },
      {
        starting_data: "2024-01-17T16:00:00.000Z",
        ending_data: "2024-01-17T16:45:00.000Z"
      }
    ]
  },
  {
    days: "Thursday",
    bookings: [
      {
        starting_data: "2024-01-18T12:00:00.000Z",
        ending_data: "2024-01-18T12:30:00.000Z"
      }
    ]
  },
  {
    days: "Friday",
    bookings: [
      {
        starting_data: "2024-01-19T13:00:00.000Z",
        ending_data: "2024-01-19T13:45:00.000Z"
      },
      {
        starting_data: "2024-01-19T17:00:00.000Z",
        ending_data: "2024-01-19T17:20:00.000Z"
      }
    ]
  }
];

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

    // Seed Slots
    const existingSlots = await Slots.countDocuments();
    if (existingSlots === 0) {
      await Slots.insertMany(dummySlots);
      console.log('✅ Slots data seeded successfully');
    } else {
      console.log('⏭️  Slots data already exists, skipping...');
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
  createDummyCustomers,
  dummySlots
}; 