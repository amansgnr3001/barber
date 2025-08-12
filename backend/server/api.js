import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Services from '../models/services.js';
import Slots from '../models/slots.js';
import Slots1 from '../models/slots1.js';
import Appointment from '../models/appointments.js';

// JWT Authentication Middleware
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Customer from '../models/customers.js';
import Barber from '../models/barber.js';

// Configure dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());





// Test route
console.log('✅ Registering test route: GET /test');
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});



//


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Authentication check:', {
    authHeader: authHeader ? 'Present' : 'Missing',
    token: token ? 'Present' : 'Missing'
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    console.log('✅ Token verified for user:', verified.email || verified.id);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Barber-specific authentication middleware
const authenticateBarber = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Barber authentication check:', {
    authHeader: authHeader ? 'Present' : 'Missing',
    token: token ? 'Present' : 'Missing'
  });

  if (!token) {
    console.log('❌ No token provided for barber access');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);

    // Check if user has barber role
    if (verified.role !== 'barber') {
      console.log('❌ Access denied: User is not a barber');
      return res.status(403).json({ error: 'Access denied. Barber privileges required.' });
    }

    req.user = verified;
    console.log('✅ Barber token verified for user:', verified.email || verified.id);
    next();
  } catch (error) {
    console.log('❌ Barber token verification failed:', error.message);
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Cancel appointment route with /api prefix
console.log('✅ Registering cancel appointment route: DELETE /api/cancelappointment/:id');
app.delete('/api/cancelappointment/:id', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== CANCEL APPOINTMENT ROUTE HIT =====`);
  console.log(`🗑️ DELETE /api/cancelappointment/:id route accessed`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

  try {
    const appointmentId = req.params.id;
    console.log(`🗑️ Cancel request received for appointment: ${appointmentId}`);

    // Validate appointment ID format
    if (!appointmentId || appointmentId.length < 12) {
      console.log(`❌ Invalid appointment ID format: ${appointmentId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
    }

    // Find the appointment first to get details for slot update
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log(`❌ Appointment not found in database: ${appointmentId}`);
      return res.status(404).json({
        success: false,
        error: 'Appointment not found. It may have already been cancelled.'
      });
    }

    console.log(`📋 Found appointment: ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}`);

    // Determine which slots collection to update based on gender
    const SlotsSchema = appointment.gender?.toLowerCase() === 'male' ? Slots : Slots1;
    console.log(`📊 Using slots collection for gender: ${appointment.gender}`);

    // Delete the appointment
    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      console.log(`❌ Failed to delete appointment from database: ${appointmentId}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete appointment from database'
      });
    }

    console.log(`✅ Appointment deleted from database: ${appointmentId}`);

    // Update the corresponding slot to make it available again
    try {
      const slotUpdate = await SlotsSchema.updateOne(
        { day: appointment.day },
        { $set: { [`${appointment.timeSlot}.available`]: true } }
      );

      console.log(`✅ Slot update successful:`, slotUpdate);

      if (slotUpdate.matchedCount === 0) {
        console.log(`⚠️ Warning: No slot document found for day ${appointment.day}`);
      }

    } catch (slotError) {
      console.error(`❌ Error updating slot availability:`, slotError);
      // Continue anyway since appointment is already deleted
    }

    // Prepare success response
    const responseData = {
      success: true,
      message: `✅ Appointment cancelled successfully for ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}. The time slot is now available for booking.`,
      cancelledAppointment: {
        id: appointment._id.toString(),
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        day: appointment.day,
        timeSlot: appointment.timeSlot,
        gender: appointment.gender,
        cancelledAt: new Date().toISOString()
      }
    };

    console.log(`🎉 Cancel operation completed successfully for: ${appointmentId}`);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Unexpected error in cancel appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while cancelling appointment',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

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

// Barber Login Route
console.log('✅ Registering barber login route: POST /api/barber/login');
app.post('/api/barber/login', async (req, res) => {
  console.log('🔐 Barber login attempt received');
  console.log('📋 Request body:', req.body);

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password'
      });
    }

    console.log(`🔍 Looking for barber with email: ${email}`);

    // Check if barber exists
    const barber = await Barber.findOne({ email });
    if (!barber) {
      console.log('❌ Barber not found');
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log(`✅ Barber found: ${barber.name}`);

    // Validate password
    const validPassword = await bcrypt.compare(password, barber.password);
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('✅ Password valid, creating token');

    // Create and assign token
    const token = jwt.sign(
      { id: barber._id, email: barber.email, role: 'barber' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🎉 Barber login successful');

    res.json({
      success: true,
      token,
      user: {
        id: barber._id,
        name: barber.name,
        email: barber.email,
        phone: barber.phonenumber,
        role: 'barber'
      }
    });
  } catch (error) {
    console.error('❌ Barber login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login'
    });
  }
});

// Cancel appointment route (working version)
console.log('✅ Registering WORKING cancel route: DELETE /api/cancel/:id');
app.delete('/api/cancel/:id', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== CANCEL ROUTE HIT =====`);
  console.log(`🗑️ DELETE /api/cancel/:id accessed`);

  try {
    const appointmentId = req.params.id;
    console.log(`🗑️ Cancelling appointment: ${appointmentId}`);

    // Find and delete the appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    // Update slot availability
    const SlotsSchema = appointment.gender?.toLowerCase() === 'male' ? Slots : Slots1;
    await SlotsSchema.updateOne(
      { day: appointment.day },
      { $set: { [`${appointment.timeSlot}.available`]: true } }
    );

    console.log(`✅ Appointment cancelled successfully: ${appointmentId}`);

    res.json({
      success: true,
      message: `Appointment cancelled successfully for ${appointment.customerName}`,
      cancelledAppointment: {
        id: appointment._id.toString(),
        customerName: appointment.customerName,
        day: appointment.day,
        timeSlot: appointment.timeSlot
      }
    });

  } catch (error) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
});

// Get all appointments for barber dashboard (barber authentication required)
console.log('✅ Registering appointments endpoint: GET /api/appointments/all');
app.get('/api/appointments/all', authenticateBarber, async (req, res) => {
  try {
    console.log('📋 Fetching all appointments from database...');

    // Get all appointments from database
    const appointments = await Appointment.find({})
      .sort({ _id: -1 }) // Sort by newest first
      .lean();

    console.log(`📊 Found ${appointments.length} appointments in database`);

    // Log first few appointments for debugging
    if (appointments.length > 0) {
      console.log('📋 Recent appointments:');
      appointments.slice(0, 3).forEach((apt, index) => {
        console.log(`  ${index + 1}. ${apt.customerName} - ${apt.status} - ${apt.day}`);
      });
    }

    // Categorize appointments by status and time
    const activeAppointments = appointments.filter(apt =>
      apt.status === 'booked' || apt.status === 'confirmed'
    );

    const cancelledAppointments = appointments.filter(apt =>
      apt.status === 'cancelled'
    );

    console.log(`✅ Active: ${activeAppointments.length}, Cancelled: ${cancelledAppointments.length}`);

    // For today/upcoming, we'll use day of week since we don't have exact dates
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });

    const todayAppointments = activeAppointments.filter(apt =>
      apt.day === currentDay
    );

    const upcomingAppointments = activeAppointments.filter(apt =>
      apt.day !== currentDay
    );

    res.json({
      success: true,
      appointments: activeAppointments, // Return only active appointments
      categorized: {
        all: activeAppointments,
        today: todayAppointments,
        upcoming: upcomingAppointments,
        cancelled: cancelledAppointments
      },
      stats: {
        total: activeAppointments.length,
        cancelled: cancelledAppointments.length,
        currentDay: currentDay
      }
    });
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      appointments: []
    });
  }
});

// Barber Dashboard - Get all appointments
app.get('/api/barber/appointments', authenticateBarber, async (req, res) => {
  try {
    // Get all appointments with populated service details
    const appointments = await Appointment.find({})
      .populate('services', 'name cost time')
      .sort({ startTime: 1 })
      .lean();

    // Group appointments by status and day
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === today.toDateString();
    });

    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate > today;
    });

    res.json({
      success: true,
      total: appointments.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      appointments: {
        all: appointments,
        today: todayAppointments,
        upcoming: upcomingAppointments
      }
    });
  } catch (error) {
    console.error('Error retrieving barber appointments:', error);
    res.status(500).json({ error: 'Error retrieving appointments' });
  }
});

// Barber Dashboard - Get appointment statistics
app.get('/api/barber/stats', authenticateBarber, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    // Get appointments for this week
    const weeklyAppointments = await Appointment.find({
      startTime: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).lean();

    // Calculate statistics
    const stats = {
      totalAppointments: await Appointment.countDocuments(),
      weeklyAppointments: weeklyAppointments.length,
      todayAppointments: weeklyAppointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === new Date().toDateString();
      }).length,
      appointmentsByDay: {
        Monday: weeklyAppointments.filter(apt => apt.day === 'Monday').length,
        Tuesday: weeklyAppointments.filter(apt => apt.day === 'Tuesday').length,
        Wednesday: weeklyAppointments.filter(apt => apt.day === 'Wednesday').length,
        Thursday: weeklyAppointments.filter(apt => apt.day === 'Thursday').length,
        Friday: weeklyAppointments.filter(apt => apt.day === 'Friday').length,
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error retrieving barber stats:', error);
    res.status(500).json({ error: 'Error retrieving statistics' });
  }
});

// Protected Route to retrieve all services (barber only)
app.get('/api/services', authenticateBarber, async (req, res) => {
  try {
    const services = await Services.find({});
    res.json(services);
  } catch (error) {
    console.error('Error retrieving services:', error);
    res.status(500).json({ error: 'Error retrieving services' });
  }
});

// Protected Route to create a new service (barber only)
app.post('/api/services', authenticateBarber, async (req, res) => {
  try {
    const { name, cost, time, gender } = req.body;

    console.log('➕ POST /api/services - Create service request:', {
      body: req.body,
      user: req.user?.email || 'Unknown'
    });

    // Validate required fields
    if (!name || !cost || !time || !gender) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        error: 'All fields are required: name, cost, time, gender'
      });
    }

    // Validate gender field
    if (!['male', 'female'].includes(gender.toLowerCase())) {
      console.log('❌ Validation failed: Invalid gender');
      return res.status(400).json({
        error: 'Invalid gender. Must be "male" or "female"'
      });
    }

    // Check if service with same name and gender already exists
    const existingService = await Services.findOne({
      name: name.trim(),
      gender: gender.toLowerCase()
    });

    if (existingService) {
      console.log('❌ Service already exists');
      return res.status(409).json({
        error: `Service "${name}" for ${gender} already exists`
      });
    }

    // Create new service
    const newService = new Services({
      name: name.trim(),
      cost: cost.trim(),
      time: time.trim(),
      gender: gender.toLowerCase()
    });

    const savedService = await newService.save();

    console.log(`✅ New service created: ${savedService.name} (${savedService.gender})`);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: savedService
    });

  } catch (error) {
    console.error('❌ Error creating service:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Error creating service' });
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

// Protected Route to update a specific service (barber only)
app.put('/api/services/:id', authenticateBarber, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, time, gender } = req.body;

    console.log('🔄 PUT /api/services/:id - Update service request:', {
      id,
      body: req.body,
      user: req.user?.email || 'Unknown'
    });

    // Validate required fields
    if (!name || !cost || !time || !gender) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        error: 'All fields are required: name, cost, time, gender'
      });
    }

    // Validate gender field
    if (!['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid gender. Must be "male" or "female"'
      });
    }

    // Check if service exists
    const existingService = await Services.findById(id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }

    // Update the service
    const updatedService = await Services.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        cost: cost.trim(),
        time: time.trim(),
        gender: gender.toLowerCase()
      },
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validations
      }
    );

    console.log(`✅ Service updated: ${updatedService.name} (${updatedService.gender})`);

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid service ID format'
      });
    }

    res.status(500).json({ error: 'Error updating service' });
  }
});



// Protected Route to delete a service (barber only)
app.delete('/api/services/:id', authenticateBarber, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await Services.findById(id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }

    // Delete the service
    await Services.findByIdAndDelete(id);

    console.log(`✅ Service deleted: ${existingService.name} (${existingService.gender})`);

    res.json({
      success: true,
      message: 'Service deleted successfully',
      deletedService: {
        id: existingService._id,
        name: existingService.name,
        gender: existingService.gender
      }
    });

  } catch (error) {
    console.error('Error deleting service:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid service ID format'
      });
    }

    res.status(500).json({ error: 'Error deleting service' });
  }
});

// Protected Route for barber to cancel appointments (barber only)
app.delete('/api/barber/cancel/:id', authenticateBarber, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /api/barber/cancel/:id - Cancel appointment request:', {
      appointmentId: id,
      user: req.user?.email || 'Unknown'
    });

    // Check if appointment exists
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      console.log('❌ Appointment not found');
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    // Update appointment status to cancelled
    const cancelledAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'barber'
      },
      { new: true }
    );

    console.log(`✅ Appointment cancelled by barber: ${existingAppointment.customerName} (${existingAppointment.customerPhone})`);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment
    });

  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid appointment ID format'
      });
    }

    res.status(500).json({ error: 'Error cancelling appointment' });
  }
});



// Retrieve weekly slots (male) with availability filtering
app.get('/api/slots', authenticateToken, async (req, res) => {
  try {
    const docs = await Slots.find({}).lean();
    const mapSlot = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const slot = arr[0];
      if (!slot || slot.name !== 'Available') return null;
      return slot.starting_time;
    };
    const result = docs.map((doc) => ({
      _id: doc._id,
      day: doc.day,
      morning: mapSlot(doc.morning),
      afternoon: mapSlot(doc.afternoon),
      evening: mapSlot(doc.evening),
    }));
    res.json(result);
  } catch (error) {
    console.error('Error retrieving slots (male):', error);
    res.status(500).json({ error: 'Error retrieving slots' });
  }
});

// Retrieve weekly slots (female) with availability filtering
app.get('/api/slots1', authenticateToken, async (req, res) => {
  try {
    const docs = await Slots1.find({}).lean();
    const mapSlot = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const slot = arr[0];
      if (!slot || slot.name !== 'Available') return null;
      return slot.starting_time;
    };
    const result = docs.map((doc) => ({
      _id: doc._id,
      day: doc.day,
      morning: mapSlot(doc.morning),
      afternoon: mapSlot(doc.afternoon),
      evening: mapSlot(doc.evening),
    }));
    res.json(result);
  } catch (error) {
    console.error('Error retrieving slots (female):', error);
    res.status(500).json({ error: 'Error retrieving slots' });
  }
});

// Accept appointment link -> creates an appointment and confirms (authentication required)
app.get('/api/appointments/accept', authenticateToken, async (req, res) => {
  try {
    console.log('aman');
    const { day, timeSlot, start, end, name, phone, gender, services } = req.query;
    if (!day || !timeSlot || !start || !end || !name || !phone || !gender) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const servicesArr = typeof services === 'string' ? services.split(',') : [];

    // Basic validation of overlap before saving
    const overlap = await Appointment.findOne({
      day,
      timeSlot,
      $or: [
        { startTime: { $lt: new Date(end) }, endTime: { $gt: new Date(start) } },
      ]
    });
    if (overlap) {
      return res.status(409).json({ error: 'Time no longer available' });
    }

    const doc = await Appointment.create({
      customerName: String(name),
      customerPhone: String(phone),
      gender: String(gender).toLowerCase(),
      day: String(day),
      timeSlot: String(timeSlot),
      startTime: new Date(String(start)),
      endTime: new Date(String(end)),
      services: servicesArr,
      status: 'booked'
    });

    console.log(`✅ Appointment created with ID: ${doc._id}`);

    res.json({
      success: true,
      message: `🎉 Appointment confirmed for ${name} on ${day} ${timeSlot}! Your booking ID is ${doc._id.toString().slice(-6)}.`,
      appointment: {
        id: doc._id.toString(), // Ensure ID is always a string
        _id: doc._id.toString(), // Backup ID field
        customerName: doc.customerName,
        customerPhone: doc.customerPhone,
        gender: doc.gender,
        day: doc.day,
        timeSlot: doc.timeSlot,
        startTime: doc.startTime,
        endTime: doc.endTime,
        status: doc.status,
        services: doc.services
      }
    });
  } catch (error) {
    console.error('Error accepting appointment:', error);
    res.status(500).json({ error: 'Error confirming appointment' });
  }
});

// Cancel appointment route (using same pattern as accept route)
app.delete('/api/appointments/cancel/:id', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== CANCEL APPOINTMENT ROUTE HIT =====`);
  console.log(`🗑️ DELETE /api/appointments/cancel/:id accessed`);

  try {
    const appointmentId = req.params.id;
    console.log(`🗑️ Cancelling appointment: ${appointmentId}`);

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    console.log(`📋 Found appointment: ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}`);

    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    // Update slot availability
    const SlotsSchema = appointment.gender?.toLowerCase() === 'male' ? Slots : Slots1;
    await SlotsSchema.updateOne(
      { day: appointment.day },
      { $set: { [`${appointment.timeSlot}.available`]: true } }
    );

    console.log(`✅ Appointment cancelled successfully: ${appointmentId}`);

    res.json({
      success: true,
      message: `✅ Appointment cancelled successfully for ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}. The time slot is now available for booking.`,
      cancelledAppointment: {
        id: appointment._id.toString(),
        customerName: appointment.customerName,
        day: appointment.day,
        timeSlot: appointment.timeSlot,
        cancelledAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
});

// Decline appointment link -> no-op confirmation (authentication required)
app.get('/api/appointments/decline', authenticateToken, (req, res) => {
  const { name, day, timeSlot } = req.query;
  const message = name && day && timeSlot
    ? `❌ Appointment declined for ${name} on ${day} ${timeSlot}. The time slot has been released and is now available for other bookings.`
    : '❌ Appointment declined. The time slot has been released.';

  res.json({ success: true, message });
});

app.get('/api/check-reset-slots', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) { // Sunday
      // Delete all documents from slots collections (male and female)
      await Slots.deleteMany({});
      await Slots1.deleteMany({});
      
      // Add 5 documents for Monday to Friday
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const makeSlotRange = (startHour, startMinute, endHour, endMinute) => [{
        name: "Available",
        starting_time: new Date(new Date().setHours(startHour, startMinute, 0, 0)),
        ending_time: new Date(new Date().setHours(endHour, endMinute, 0, 0))
      }];

      const newSlots = weekDays.map(day => ({
        day: day,
        morning: makeSlotRange(9, 0, 12, 0),        // 9:00 AM - 12:00 PM
        afternoon: makeSlotRange(12, 0, 13, 30),    // 12:00 PM - 1:30 PM
        evening: makeSlotRange(14, 30, 18, 0)       // 2:30 PM - 6:00 PM
      }));
      
      await Slots.insertMany(newSlots);
      await Slots1.insertMany(newSlots);
      
      res.json({ message: 'Slots reset successfully for the new week (male & female)' });
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
    console.log('tiru');
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
    
    // Check if the requested service duration can fit within the slot window considering existing appointments
    const checkSlotAvailability = async (day, timeSlot, slots, totalTimeMinutes) => {
      if (!Array.isArray(slots) || slots.length === 0) return false;

      // Check the first slot in the array
      const slot = slots[0];
      if (slot.name !== "Available") return false;

      const windowStart = new Date(slot.starting_time);
      const windowEnd = new Date(slot.ending_time);

      // CRITICAL FIX: Check if service duration exceeds slot capacity
      const slotDurationMinutes = (windowEnd - windowStart) / (1000 * 60);
      if (totalTimeMinutes > slotDurationMinutes) {
        console.log(`❌ Service duration (${totalTimeMinutes}min) exceeds slot capacity (${slotDurationMinutes}min)`);
        return false;
      }

      // Fetch existing appointments for the same day and time slot
      const existing = await Appointment.find({ day, timeSlot }).lean();

      // Build a list of blocked intervals
      const blocked = existing.map(a => ({ start: new Date(a.startTime), end: new Date(a.endTime) }));

      // Try to place the new appointment at the earliest available time in the window
      const durationMs = totalTimeMinutes * 60 * 1000;
      let candidateStart = new Date(windowStart);

      // Sort blocked by start time to scan gaps
      blocked.sort((a, b) => a.start.getTime() - b.start.getTime());

      for (const b of blocked) {
        // If candidate fits entirely before this blocked interval
        const candidateEnd = new Date(candidateStart.getTime() + durationMs);
        if (candidateEnd <= b.start && candidateStart >= windowStart) {
          return { start: candidateStart, end: candidateEnd };
        }
        // Move candidate start to end of this blocked interval if overlapping
        if (candidateStart < b.end) {
          candidateStart = new Date(b.end);
        }
        // If candidate start moved beyond window end, no availability
        if (candidateStart.getTime() + durationMs > windowEnd.getTime()) {
          return false;
        }
      }

      // After processing all blocked intervals, try to fit at the end
      const finalEnd = new Date(candidateStart.getTime() + durationMs);
      if (candidateStart >= windowStart && finalEnd <= windowEnd) {
        return { start: candidateStart, end: finalEnd };
      }
      
      return false;
    };
    
    // Helper function to send booking response
    const sendBookingResponse = (day, timeSlot, proposed) => {
      const startTime = proposed.start;
      const endTime = proposed.end;
      
      const base = `${req.protocol}://${req.get('host')}`;
      return res.json({
        success: true,
        message: `A slot is available from ${startTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()} on ${day}. Please accept to confirm.`,
        appointment: {
          day: day,
          timeSlot: timeSlot,
          startTime: startTime,
          endTime: endTime
        },
        links: {
          accept: `${base}/api/appointments/accept?day=${encodeURIComponent(day)}&timeSlot=${encodeURIComponent(timeSlot)}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&name=${encodeURIComponent(fullName)}&phone=${encodeURIComponent(phoneNumber)}&gender=${encodeURIComponent(gender)}&services=${encodeURIComponent(services.join(','))}`,
          decline: `${base}/api/appointments/decline`
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
      
      const proposed = await checkSlotAvailability(preferredDay, preferredTime, slots, totalTimeMinutes);
      if (!proposed) {
        // Check if it's a duration issue
        const slot = slots[0];
        const slotDurationMinutes = (new Date(slot.ending_time) - new Date(slot.starting_time)) / (1000 * 60);

        if (totalTimeMinutes > slotDurationMinutes) {
          return res.json({
            success: false,
            message: `Selected services require ${totalTimeMinutes} minutes, but ${preferredDay} ${preferredTime} slot only has ${slotDurationMinutes} minutes available. Please choose fewer services or a different time slot.`
          });
        }

        return res.json({
          success: false,
          message: `No available time found within ${preferredDay} ${preferredTime} due to existing bookings.`
        });
      }
      return sendBookingResponse(preferredDay, preferredTime, proposed);
    }
    
    // Case 2: Any day but specific slot
    else if (preferredDay === 'Anyday' && preferredTime !== 'anytime') {
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      for (const day of weekDays) {
        const daySlot = await SlotsSchema.findOne({ day: day });
        
        if (daySlot) {
          const slots = daySlot[preferredTime];
          
          const proposed = await checkSlotAvailability(day, preferredTime, slots, totalTimeMinutes);
          if (proposed) {
            return sendBookingResponse(day, preferredTime, proposed);
          }

          // Check if it's a duration issue for this day
          const slot = slots[0];
          const slotDurationMinutes = (new Date(slot.ending_time) - new Date(slot.starting_time)) / (1000 * 60);
          if (totalTimeMinutes > slotDurationMinutes) {
            console.log(`⚠️ ${day} ${preferredTime}: Service duration (${totalTimeMinutes}min) exceeds slot capacity (${slotDurationMinutes}min)`);
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
            
            const proposed = await checkSlotAvailability(day, timeSlot, slots, totalTimeMinutes);
            if (proposed) {
              return sendBookingResponse(day, timeSlot, proposed);
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
        
        const proposed = await checkSlotAvailability(preferredDay, timeSlot, slots, totalTimeMinutes);
        if (proposed) {
          return sendBookingResponse(preferredDay, timeSlot, proposed);
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
        starting_time: new Date(new Date().setHours(hour, minute, 0, 0)),
        ending_time: new Date(new Date().setHours(hour + 1, minute, 0, 0))
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
  console.log(`✅ POST /api/services route should be available for creating services`);
  console.log(`✅ PUT /api/services/:id route should be available for updating services`);
  console.log(`✅ DELETE /api/services/:id route should be available for deleting services`);
});

export default app;
