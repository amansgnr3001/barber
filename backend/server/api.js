import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Services from '../models/services.js';
import Slots from '../models/slots.js';
import Slots1 from '../models/slots1.js';

// JWT Authentication Middleware
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Customer from '../models/customers.js';

// Configure dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());





// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

//


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // Check if customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: 'Email not found' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create and assign token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        gender: customer.gender
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Protected Route to retrieve all services
app.get('/api/services', authenticateToken, async (req, res) => {
  try {
    const services = await Services.find({});
    res.json(services);
  } catch (error) {
    console.error('Error retrieving services:', error);
    res.status(500).json({ error: 'Error retrieving services' });
  }
});

// Route to retrieve services by gender (no authentication required for booking page)
app.get('/api/services/:gender', async (req, res) => {
  try {
    const { gender } = req.params;
    
    // Validate gender parameter
    if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid gender parameter. Must be "male" or "female"' 
      });
    }
    
    const services = await Services.find({
      gender: gender.toLowerCase()
    });
    
    if (services.length === 0) {
      return res.status(404).json({ 
        error: `No services found for ${gender}`,
        services: []
      });
    }
    
    res.json({
      success: true,
      gender: gender.toLowerCase(),
      count: services.length,
      services: services
    });
    
  } catch (error) {
    console.error('Error retrieving services by gender:', error);
    res.status(500).json({ error: 'Error retrieving services by gender' });
  }
});



app.get('/api/check-reset-slots', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) { // Sunday
      // Delete all documents from slots collection
      await Slots.deleteMany({});
      
      // Add 5 documents for Monday to Friday
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const makeSlot = (hour, minute) => [{
        name: "Available",
        starting_time: new Date().setHours(hour, minute, 0, 0),
        ending_time: new Date().setHours(hour + 1, minute, 0, 0)  // Set ending time to 1 hour after starting time
      }];

      const newSlots = weekDays.map(day => ({
        day: day,
        morning: makeSlot(9, 0),    // 9:00 AM - 10:00 AM
        afternoon: makeSlot(12, 0),  // 12:00 PM - 1:00 PM
        evening: makeSlot(14, 30)    // 2:30 PM - 3:30 PM
      }));
      
      await Slots.insertMany(newSlots);
      
      res.json({ message: 'Slots reset successfully for the new week' });
    } else {
      res.json({ message: 'Today is not Sunday, no reset needed' });
    }
  } catch (error) {
    console.error('Error resetting slots:', error);
    res.status(500).json({ error: 'Error resetting slots' });
  }
});

app.post('/api/book-appointment', authenticateToken, async (req, res) => {
  try {
    const { fullName, phoneNumber, gender, preferredDay, preferredTime, services } = req.body;
    
    // Retrieve service details and calculate total time
    const serviceDetails = await Services.find({ _id: { $in: services } });
    let totalTimeMinutes = 0;
    
    serviceDetails.forEach(service => {
      const timeString = service.time;
      const minutes = parseInt(timeString.split(' ')[0]);
      totalTimeMinutes += minutes;
    });
    
    // Determine which schema to use based on gender
    const SlotsSchema = gender.toLowerCase() === 'male' ? Slots : Slots1;
    
    // Time limits for each slot
    const timeConstraints = {
      morning: { hour: 12, minute: 0 }, // 12:00 PM
      afternoon: { hour: 13, minute: 30 }, // 1:30 PM
      evening: { hour: 18, minute: 0 } // 6:00 PM
    };
    
    // Helper function to check if slot is available
    const checkSlotAvailability = (slots, totalTimeMinutes) => {
      if (!Array.isArray(slots) || slots.length === 0) return false;
      
      // Check the first slot in the array
      const slot = slots[0];
      if (slot.name !== "Available") return false;
      
      const startTime = new Date(slot.starting_time);
      const endTime = new Date(slot.ending_time);
      
      // Calculate available time in minutes
      const availableMinutes = (endTime - startTime) / (1000 * 60);
      return availableMinutes >= totalTimeMinutes;
    };
    
    // Helper function to send booking response
    const sendBookingResponse = (slots, day, timeSlot) => {
      const slot = slots[0]; // Get the first available slot
      const startTime = new Date(slot.starting_time);
      const endTime = new Date(slot.ending_time);
      
      return res.json({
        success: true,
        message: `Your appointment is scheduled for ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()} on ${day}`,
        appointment: {
          day: day,
          timeSlot: timeSlot,
          startTime: startTime,
          endTime: endTime
        }
      });
    };
    
    // Case 1: Specific day and specific slot
    if (preferredDay !== 'Anyday' && preferredTime !== 'anytime') {
      const daySlot = await SlotsSchema.findOne({ day: preferredDay });
      
      if (!daySlot) {
        return res.json({ 
          success: false,
          message: 'No slots available for the preferred day' 
        });
      }
      
      const slots = daySlot[preferredTime];
      
      if (!checkSlotAvailability(slots, totalTimeMinutes)) {
        return res.json({ 
          success: false,
          message: `All slots are booked for ${preferredDay} ${preferredTime}` 
        });
      }
      
      return sendBookingResponse(slots, preferredDay, preferredTime);
    }
    
    // Case 2: Any day but specific slot
    else if (preferredDay === 'Anyday' && preferredTime !== 'anytime') {
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      for (const day of weekDays) {
        const daySlot = await SlotsSchema.findOne({ day: day });
        
        if (daySlot) {
          const slots = daySlot[preferredTime];
          
          if (checkSlotAvailability(slots, totalTimeMinutes)) {
            return sendBookingResponse(slots, day, preferredTime);
          }
        }
      }
      
      return res.json({ 
        success: false,
        message: `No slots available in ${preferredTime} for any day` 
      });
    }
    
    // Case 3: Any day and any time
    else if (preferredDay === 'Anyday' && preferredTime === 'anytime') {
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const timeSlots = ['morning', 'afternoon', 'evening'];
      
      for (const day of weekDays) {
        const daySlot = await SlotsSchema.findOne({ day: day });
        
        if (daySlot) {
          for (const timeSlot of timeSlots) {
            const slots = daySlot[timeSlot];
            
            if (checkSlotAvailability(slots, totalTimeMinutes)) {
              return sendBookingResponse(slots, day, timeSlot);
            }
          }
        }
      }
      
      return res.json({ 
        success: false,
        message: 'No slots available for any day and time' 
      });
    }
    
    // Case 4: Specific day but any time
    else if (preferredDay !== 'Anyday' && preferredTime === 'anytime') {
      const daySlot = await SlotsSchema.findOne({ day: preferredDay });
      
      if (!daySlot) {
        return res.json({ 
          success: false,
          message: `No slots available for ${preferredDay}` 
        });
      }
      
      const timeSlots = ['morning', 'afternoon', 'evening'];
      
      for (const timeSlot of timeSlots) {
        const slots = daySlot[timeSlot];
        
        if (checkSlotAvailability(slots, totalTimeMinutes)) {
          return sendBookingResponse(slots, preferredDay, timeSlot);
        }
      }
      
      return res.json({ 
        success: false,
        message: `No slots available for ${preferredDay}` 
      });
    }
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
});

// Function to check and reset slots
const checkAndResetSlots = async () => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek === 0) { // Sunday
      // Delete all documents from slots collection
      await Slots.deleteMany({});
      
      // Add 5 documents for Monday to Friday
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const makeSlot = (hour, minute) => [{
        name: "Available",
        starting_time: new Date().setHours(hour, minute, 0, 0),
        ending_time: new Date().setHours(hour + 1, minute, 0, 0)
      }];

      const newSlots = weekDays.map(day => ({
        day: day,
        morning: makeSlot(9, 0),    // 9:00 AM - 10:00 AM
        afternoon: makeSlot(12, 0),  // 12:00 PM - 1:00 PM
        evening: makeSlot(14, 30)    // 2:30 PM - 3:30 PM
      }));
      
      await Slots.insertMany(newSlots);
      console.log('Slots reset successfully for the new week');
    } else {
      console.log('Today is not Sunday, no reset needed');
    }
  } catch (error) {
    console.error('Error checking/resetting slots:', error);
  }
};

// Set up interval to check slots every day (in milliseconds)
const ONE_DAY = 24 * 60 * 60 * 1000;  // 86400000 milliseconds (24 hours)
let intervalId = setInterval(checkAndResetSlots, ONE_DAY);

// Run initial check when server starts
checkAndResetSlots();

// Log next check time
console.log('Next slot check will be at:', new Date(Date.now() + ONE_DAY).toLocaleString());

// Handle cleanup on server shutdown
process.on('SIGTERM', () => {
  clearInterval(intervalId);
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barber';

// Mock services data for when MongoDB is not available
const mockServices = [
  {
    _id: '1',
    name: 'Haircut',
    price: 25,
    time: '30 minutes',
    gender: 'male'
  },
  {
    _id: '2',
    name: 'Beard Trim',
    price: 15,
    time: '20 minutes',
    gender: 'male'
  },
  {
    _id: '3',
    name: 'Hair Styling',
    price: 30,
    time: '45 minutes',
    gender: 'female'
  },
  {
    _id: '4',
    name: 'Hair Coloring',
    price: 60,
    time: '90 minutes',
    gender: 'female'
  }
];

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log(`Connected to MongoDB successfully at ${MONGODB_URI}`);
    
    // Seed dummy data
    try {
      const { seedAllData } = await import('../seedData.js');
      await seedAllData();
    } catch (error) {
      console.log('Could not seed data:', error.message);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  console.log('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start the server regardless of MongoDB connection status
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Services API at: http://localhost:${PORT}/api/services`);
  console.log(`Gender-based services API at: http://localhost:${PORT}/api/services/:gender`);
});

export default app;
