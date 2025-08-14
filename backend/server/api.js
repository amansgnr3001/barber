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

// Validation utilities
const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  },
  
  // Phone number validation
  isValidPhoneNumber: (phoneNumber) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phoneNumber);
  },
  
  // Gender validation
  isValidGender: (gender, allowOther = true) => {
    const validGenders = allowOther ? ['male', 'female', 'other'] : ['male', 'female'];
    return validGenders.includes(gender?.toLowerCase());
  },
  
  // Required fields validation
  areRequiredFieldsPresent: (obj, requiredFields) => {
    return requiredFields.every(field => obj[field] !== undefined && obj[field] !== null && obj[field] !== '');
  },
  
  // Error response generator
  generateErrorResponse: (message, details = null, statusCode = 400) => {
    const response = {
      success: false,
      error: message
    };
    
    if (details) {
      response.details = details;
    }
    
    return { response, statusCode };
  }
};

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

// Consolidated cancel appointment route
console.log('✅ Registering consolidated cancel route: DELETE /api/appointments/:id/cancel');
app.delete('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== CANCEL APPOINTMENT ROUTE HIT =====`);
  console.log(`🗑️ DELETE /api/appointments/:id/cancel route accessed`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`👤 User: ${req.user?.email || req.user?.id || 'Unknown'}`);

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

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log(`❌ Appointment not found in database: ${appointmentId}`);
      return res.status(404).json({
        success: false,
        error: 'Appointment not found. It may have already been cancelled.'
      });
    }

    console.log(`📋 Found appointment: ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}`);

    // Check if user is authorized to cancel this appointment
    // Barbers can cancel any appointment, customers can only cancel their own
    const isBarber = req.user?.role === 'barber';
    const isOwner = req.user?.id === appointment.customerId?.toString() ||
                    req.user?.email === appointment.customerEmail;
    
    if (!isBarber && !isOwner) {
      console.log(`❌ Unauthorized cancellation attempt by user: ${req.user?.email || req.user?.id}`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to cancel this appointment'
      });
    }

    // Determine which slots collection to update based on gender
    const SlotsSchema = slotUtils.getSlotsModel(appointment.gender);
    console.log(`📊 Using slots collection for gender: ${appointment.gender}`);

    // Update appointment status instead of deleting it (to maintain history)
    const cancelledAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: isBarber ? 'barber' : 'customer'
      },
      { new: true }
    );

    if (!cancelledAppointment) {
      console.log(`❌ Failed to update appointment status: ${appointmentId}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel appointment'
      });
    }

    console.log(`✅ Appointment status updated to cancelled: ${appointmentId}`);

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
      // Continue anyway since appointment status is already updated
    }

    // Prepare success response
    const responseData = {
      success: true,
      message: `✅ Appointment cancelled successfully for ${appointment.customerName} on ${appointment.day} ${appointment.timeSlot}. The time slot is now available for booking.`,
      cancelledAppointment: {
        id: cancelledAppointment._id.toString(),
        customerName: cancelledAppointment.customerName,
        customerPhone: cancelledAppointment.customerPhone,
        day: cancelledAppointment.day,
        timeSlot: cancelledAppointment.timeSlot,
        gender: cancelledAppointment.gender,
        status: cancelledAppointment.status,
        cancelledAt: cancelledAppointment.cancelledAt,
        cancelledBy: cancelledAppointment.cancelledBy
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

// Customer Login Route
console.log('✅ Registering customer login route: POST /api/login');
app.post('/api/login', async (req, res) => {
  console.log('🔐 Customer login attempt received');
  console.log('📋 Request body:', { email: req.body.email ? '****@****.***' : 'missing', password: req.body.password ? '********' : 'missing' });

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

    console.log(`🔍 Looking for customer with email: ${email.substring(0, 3)}***`);

    // Check if customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.log('❌ Customer not found');
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log(`✅ Customer found: ${customer.name}`);

    // Validate password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('✅ Password valid, creating token');

    // Update last login time
    await Customer.findByIdAndUpdate(
      customer._id,
      { lastLogin: new Date() },
      { new: true }
    );

    // Create and assign token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🎉 Customer login successful');

    res.json({
      success: true,
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        gender: customer.gender,
        phone: customer.phone_number,
        customerType: customer.customerType || 'regular',
        preferences: customer.preferences || {}
      }
    });
  } catch (error) {
    console.error('❌ Customer login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login'
    });
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

// Customer Registration Route
console.log('✅ Registering customer registration route: POST /api/register');
app.post('/api/register', async (req, res) => {
  console.log('👤 Customer registration attempt received');
  
  try {
    const {
      name,
      email,
      password,
      phone_number,
      gender,
      address,
      dateOfBirth,
      customerType,
      enrollment_number,
      course,
      year,
      preferences
    } = req.body;

    console.log('📋 Registration request for:', {
      name,
      email: email ? email.substring(0, 3) + '***' : 'missing',
      phone: phone_number ? '****' + phone_number.substring(phone_number.length - 4) : 'missing',
      gender,
      customerType: customerType || 'regular'
    });

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'phone_number', 'gender'];
    if (!validationUtils.areRequiredFieldsPresent(req.body, requiredFields)) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: name, email, password, phone_number, and gender are required'
      });
    }

    // Validate email format
    if (!validationUtils.isValidEmail(email)) {
      console.log('❌ Validation failed: Invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate phone number format
    if (!validationUtils.isValidPhoneNumber(phone_number)) {
      console.log('❌ Validation failed: Invalid phone number format');
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid phone number'
      });
    }

    // Validate gender
    if (!validationUtils.isValidGender(gender)) {
      console.log('❌ Validation failed: Invalid gender');
      return res.status(400).json({
        success: false,
        error: 'Gender must be one of: male, female, other'
      });
    }

    // Check if customer with this email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      console.log('❌ Registration failed: Email already in use');
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }

    // Check if customer with this phone number already exists
    const existingPhone = await Customer.findOne({ phone_number });
    if (existingPhone) {
      console.log('❌ Registration failed: Phone number already in use');
      return res.status(409).json({
        success: false,
        error: 'Phone number already in use'
      });
    }

    // Validate student-specific fields if customerType is 'student'
    if (customerType === 'student') {
      if (!enrollment_number || !course || !year) {
        console.log('❌ Validation failed: Missing student-specific fields');
        return res.status(400).json({
          success: false,
          error: 'For student registration, enrollment_number, course, and year are required'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      customerType: customerType || 'regular',
      enrollment_number,
      course,
      year,
      preferences,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    // Save customer to database
    const savedCustomer = await newCustomer.save();
    console.log(`✅ New customer registered: ${savedCustomer.name} (${savedCustomer._id})`);

    // Create and assign token
    const token = jwt.sign(
      { id: savedCustomer._id, email: savedCustomer.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: savedCustomer._id,
        name: savedCustomer.name,
        email: savedCustomer.email,
        gender: savedCustomer.gender,
        phone: savedCustomer.phone_number,
        customerType: savedCustomer.customerType
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'An error occurred during registration'
    });
  }
});

// Legacy cancel route - redirect to the consolidated route
console.log('✅ Registering legacy cancel route redirect: DELETE /api/cancel/:id');
app.delete('/api/cancel/:id', authenticateToken, (req, res, next) => {
  console.log(`\n🔄 Redirecting from legacy cancel route to consolidated route`);
  req.url = `/api/appointments/${req.params.id}/cancel`;
  next();
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
    if (!validationUtils.isValidGender(gender, false)) {
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
    if (!gender || !validationUtils.isValidGender(gender, false)) {
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
    if (!validationUtils.isValidGender(gender, false)) {
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

// Legacy barber cancel route - redirect to the consolidated route with barber authentication
console.log('✅ Registering legacy barber cancel route: DELETE /api/barber/cancel/:id');
app.delete('/api/barber/cancel/:id', authenticateBarber, (req, res, next) => {
  console.log(`\n🔄 Redirecting from legacy barber cancel route to consolidated route`);
  req.url = `/api/appointments/${req.params.id}/cancel`;
  next();
});

// Get customer profile
console.log('✅ Registering customer profile route: GET /api/customer/profile');
app.get('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
    console.log(`🔍 Fetching profile for customer: ${req.user.id}`);
    
    const customer = await Customer.findById(req.user.id).select('-password');
    
    if (!customer) {
      console.log('❌ Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    console.log(`✅ Profile fetched successfully for: ${customer.name}`);
    
    res.json({
      success: true,
      profile: customer
    });
  } catch (error) {
    console.error('❌ Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching profile'
    });
  }
});

// Update customer profile
console.log('✅ Registering update profile route: PUT /api/customer/profile');
app.put('/api/customer/profile', authenticateToken, async (req, res) => {
  try {
    console.log(`🔄 Update profile request for customer: ${req.user.id}`);
    
    const {
      name,
      phone_number,
      gender,
      address,
      dateOfBirth,
      preferences,
      // Student-specific fields
      enrollment_number,
      course,
      year
    } = req.body;
    
    // Find customer
    const customer = await Customer.findById(req.user.id);
    
    if (!customer) {
      console.log('❌ Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Validate phone number if provided
    if (phone_number) {
      if (!validationUtils.isValidPhoneNumber(phone_number)) {
        console.log('❌ Validation failed: Invalid phone number format');
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid phone number'
        });
      }
      
      // Check if phone number is already in use by another customer
      const existingPhone = await Customer.findOne({
        phone_number,
        _id: { $ne: req.user.id }
      });
      
      if (existingPhone) {
        console.log('❌ Update failed: Phone number already in use');
        return res.status(409).json({
          success: false,
          error: 'Phone number already in use by another customer'
        });
      }
    }
    
    // Validate gender if provided
    if (gender && !validationUtils.isValidGender(gender)) {
      console.log('❌ Validation failed: Invalid gender');
      return res.status(400).json({
        success: false,
        error: 'Gender must be one of: male, female, other'
      });
    }
    
    // Validate student-specific fields if customer is a student
    if (customer.customerType === 'student') {
      if ((enrollment_number === '' || course === '' || year === '') &&
          (enrollment_number !== undefined || course !== undefined || year !== undefined)) {
        console.log('❌ Validation failed: Incomplete student information');
        return res.status(400).json({
          success: false,
          error: 'For student profiles, enrollment_number, course, and year must all be provided'
        });
      }
    }
    
    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phone_number) updateData.phone_number = phone_number;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (preferences) updateData.preferences = preferences;
    
    // Update student-specific fields if customer is a student
    if (customer.customerType === 'student') {
      if (enrollment_number) updateData.enrollment_number = enrollment_number;
      if (course) updateData.course = course;
      if (year) updateData.year = year;
    }
    
    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log(`✅ Profile updated successfully for: ${updatedCustomer.name}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedCustomer
    });
  } catch (error) {
    console.error('❌ Error updating customer profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error updating profile'
    });
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
  console.log(`\n🎯 ===== ACCEPT APPOINTMENT ROUTE HIT =====`);
  console.log(`📅 GET /api/appointments/accept route accessed`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`👤 User: ${req.user?.email || req.user?.id || 'Unknown'}`);
  
  try {
    console.log('📋 Request query parameters:', JSON.stringify(req.query, null, 2));
    
    const { day, timeSlot, start, end, name, phone, gender, services } = req.query;
    
    // Validate required parameters
    if (!day || !timeSlot || !start || !end || !name || !phone || !gender) {
      console.log('❌ Validation failed: Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        details: 'day, timeSlot, start, end, name, phone, and gender are required'
      });
    }
    
    // Parse services array
    const servicesArr = typeof services === 'string' ? services.split(',') : [];
    console.log(`📋 Services to book: ${servicesArr.join(', ') || 'None'}`);
    
    // Validate date formats
    try {
      const startDate = new Date(String(start));
      const endDate = new Date(String(end));
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('❌ Validation failed: Invalid date format');
        return res.status(400).json({
          success: false,
          error: 'Invalid date format',
          details: 'start and end times must be valid ISO date strings'
        });
      }
      
      console.log(`📅 Appointment time: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()} on ${day}`);
    } catch (dateError) {
      console.error('❌ Date parsing error:', dateError);
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        details: dateError.message
      });
    }

    // Check for overlapping appointments
    console.log(`🔍 Checking for overlapping appointments...`);
    const overlap = await Appointment.findOne({
      day,
      timeSlot,
      status: { $in: ['booked', 'confirmed'] }, // Only consider active appointments
      $or: [
        { startTime: { $lt: new Date(end) }, endTime: { $gt: new Date(start) } },
      ]
    });
    
    if (overlap) {
      console.log(`❌ Time slot no longer available - overlaps with appointment ID: ${overlap._id}`);
      return res.status(409).json({
        success: false,
        error: 'Time no longer available',
        details: 'The requested time slot has been booked by another customer'
      });
    }
    
    console.log(`✅ No overlapping appointments found, proceeding with booking`);

    // Create the appointment
    const doc = await Appointment.create({
      customerName: String(name),
      customerPhone: String(phone),
      gender: String(gender).toLowerCase(),
      day: String(day),
      timeSlot: String(timeSlot),
      startTime: new Date(String(start)),
      endTime: new Date(String(end)),
      services: servicesArr,
      status: 'booked',
      customerId: req.user?.id, // Link to customer account if authenticated
      customerEmail: req.user?.email,
      bookedAt: new Date()
    });

    console.log(`✅ Appointment created with ID: ${doc._id}`);
    
    // Determine which slots collection to update based on gender
    const SlotsSchema = slotUtils.getSlotsModel(gender);
    
    // Update the slot to mark it as booked
    try {
      await SlotsSchema.updateOne(
        { day: day },
        { $set: { [`${timeSlot}.0.booked`]: true } }
      );
      console.log(`✅ Slot marked as booked in the database`);
    } catch (slotError) {
      console.error(`⚠️ Warning: Could not update slot status:`, slotError);
      // Continue anyway since appointment is created
    }

    // Prepare success response
    const responseData = {
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
        services: doc.services,
        duration: Math.round((new Date(end) - new Date(start)) / (1000 * 60)) + ' minutes'
      }
    };
    
    console.log(`🎉 Appointment booking completed successfully`);
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Unexpected error in accept appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error confirming appointment',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// Legacy cancel appointment route - redirect to the consolidated route
console.log('✅ Registering legacy cancel appointment route: DELETE /api/appointments/cancel/:id');
app.delete('/api/appointments/cancel/:id', authenticateToken, (req, res, next) => {
  console.log(`\n🔄 Redirecting from legacy appointments cancel route to consolidated route`);
  req.url = `/api/appointments/${req.params.id}/cancel`;
  next();
});

// Decline appointment link -> no-op confirmation (authentication required)
app.get('/api/appointments/decline', authenticateToken, (req, res) => {
  console.log(`\n🎯 ===== DECLINE APPOINTMENT ROUTE HIT =====`);
  console.log(`📅 GET /api/appointments/decline route accessed`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`👤 User: ${req.user?.email || req.user?.id || 'Unknown'}`);
  
  try {
    console.log('📋 Request query parameters:', JSON.stringify(req.query, null, 2));
    
    const { name, day, timeSlot } = req.query;
    
    // Log the decline action
    if (name && day && timeSlot) {
      console.log(`❌ Appointment declined for ${name} on ${day} ${timeSlot}`);
    } else {
      console.log(`❌ Appointment declined with incomplete information`);
    }
    
    const message = name && day && timeSlot
      ? `❌ Appointment declined for ${name} on ${day} ${timeSlot}. The time slot has been released and is now available for other bookings.`
      : '❌ Appointment declined. The time slot has been released.';

    console.log(`🎉 Decline operation completed successfully`);
    res.json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Unexpected error in decline appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing decline request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// Utility function to handle slot operations
const slotUtils = {
  // Create slot time range
  makeSlotRange: (startHour, startMinute, endHour, endMinute) => [{
    name: "Available",
    starting_time: new Date(new Date().setHours(startHour, startMinute, 0, 0)),
    ending_time: new Date(new Date().setHours(endHour, endMinute, 0, 0))
  }],
  
  // Create weekly slots for both genders
  createWeeklySlots: async () => {
    try {
      // Delete all documents from slots collections (male and female)
      console.log(`🗑️ Deleting existing slots for male customers...`);
      const maleDeleteResult = await Slots.deleteMany({});
      console.log(`✅ Deleted ${maleDeleteResult.deletedCount} male slot documents`);
      
      console.log(`🗑️ Deleting existing slots for female customers...`);
      const femaleDeleteResult = await Slots1.deleteMany({});
      console.log(`✅ Deleted ${femaleDeleteResult.deletedCount} female slot documents`);
      
      // Add 5 documents for Monday to Friday
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      console.log(`📝 Creating new slots for days: ${weekDays.join(', ')}`);
      
      const newSlots = weekDays.map(day => ({
        day: day,
        morning: slotUtils.makeSlotRange(9, 0, 12, 0),        // 9:00 AM - 12:00 PM
        afternoon: slotUtils.makeSlotRange(12, 0, 13, 30),    // 12:00 PM - 1:30 PM
        evening: slotUtils.makeSlotRange(14, 30, 18, 0)       // 2:30 PM - 6:00 PM
      }));
      
      console.log(`📊 Slot configuration created with time ranges:
        - Morning: 9:00 AM - 12:00 PM
        - Afternoon: 12:00 PM - 1:30 PM
        - Evening: 2:30 PM - 6:00 PM`);
      
      console.log(`💾 Inserting new slots for male customers...`);
      const maleInsertResult = await Slots.insertMany(newSlots);
      console.log(`✅ Created ${maleInsertResult.length} male slot documents`);
      
      console.log(`💾 Inserting new slots for female customers...`);
      const femaleInsertResult = await Slots1.insertMany(newSlots);
      console.log(`✅ Created ${femaleInsertResult.length} female slot documents`);
      
      return {
        success: true,
        message: 'Slots reset successfully for the new week (male & female)',
        stats: {
          deleted: {
            male: maleDeleteResult.deletedCount,
            female: femaleDeleteResult.deletedCount
          },
          created: {
            male: maleInsertResult.length,
            female: femaleInsertResult.length
          }
        }
      };
    } catch (error) {
      console.error('❌ Error creating weekly slots:', error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  // Get slots model based on gender
  getSlotsModel: (gender) => {
    console.log(`🔍 Getting slots model for gender: "${gender}"`);
    
    if (!gender) {
      console.log(`⚠️ Warning: Gender is undefined or null, defaulting to female slots`);
      return Slots1; // Default to female slots if gender is undefined
    }
    
    const normalizedGender = gender.toLowerCase();
    
    if (normalizedGender === 'male') {
      console.log(`✅ Using male slots model`);
      return Slots;
    } else if (normalizedGender === 'female') {
      console.log(`✅ Using female slots model`);
      return Slots1;
    } else {
      console.log(`⚠️ Warning: Unknown gender "${gender}", defaulting to female slots`);
      return Slots1; // Default to female slots for unknown gender
    }
  }
};

app.get('/api/check-reset-slots', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== CHECK/RESET SLOTS ROUTE HIT =====`);
  console.log(`📅 GET /api/check-reset-slots route accessed`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`👤 User: ${req.user?.email || req.user?.id || 'Unknown'}`);
  
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    console.log(`📆 Current day of week: ${dayOfWeek} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);
    
    if (dayOfWeek === 0) { // Sunday
      console.log(`🔄 Today is Sunday - proceeding with weekly slot reset`);
      
      // Use the utility function to create weekly slots
      const result = await slotUtils.createWeeklySlots();
      
      console.log(`🎉 Weekly slot reset completed successfully`);
      res.json(result);
    } else {
      console.log(`ℹ️ Today is not Sunday - no reset needed`);
      res.json({
        success: true,
        message: 'Today is not Sunday, no reset needed',
        currentDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        nextResetDay: 'Sunday'
      });
    }
  } catch (error) {
    console.error('❌ Error resetting slots:', error);
    res.status(500).json({
      success: false,
      error: 'Error resetting slots',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while resetting slots'
    });
  }
});

app.post('/api/book-appointment', authenticateToken, async (req, res) => {
  console.log(`\n🎯 ===== BOOK APPOINTMENT ROUTE HIT =====`);
  console.log(`📅 POST /api/book-appointment route accessed`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  console.log(`🆔 Request IP: ${req.ip || 'unknown'}`);
  console.log(`🔑 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`👤 User: ${req.user?.email || req.user?.id || 'Unknown'}`);
  
  try {
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    // Extract request data
    const { fullName, phoneNumber, gender, preferredDay, preferredTime, services } = req.body;
    
    // Validate required fields
    const requiredFields = ['fullName', 'phoneNumber', 'gender', 'preferredDay', 'preferredTime', 'services'];
    if (!validationUtils.areRequiredFieldsPresent(req.body, requiredFields)) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Required fields missing',
        details: 'fullName, phoneNumber, gender, preferredDay, preferredTime, and services are required'
      });
    }
    
    // Validate services array
    if (!Array.isArray(services) || services.length === 0) {
      console.log('❌ Validation failed: Invalid services array');
      return res.status(400).json({
        success: false,
        error: 'Invalid services',
        details: 'services must be a non-empty array of service IDs'
      });
    }
    
    // Validate gender (only male/female for services, not 'other')
    if (!validationUtils.isValidGender(gender, false)) {
      console.log(`❌ Validation failed: Invalid gender value: ${gender}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid gender',
        details: 'Gender must be either "male" or "female"'
      });
    }
    
    // Validate phone number format
    if (!validationUtils.isValidPhoneNumber(phoneNumber)) {
      console.log('❌ Validation failed: Invalid phone number format');
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        details: 'Please provide a valid phone number'
      });
    }
    
    console.log(`🔍 Retrieving service details for IDs: ${services.join(', ')}`);
    
    // Retrieve service details and calculate total time
    try {
      const serviceDetails = await Services.find({ _id: { $in: services } });
      
      // Check if all requested services were found
      if (serviceDetails.length !== services.length) {
        console.log(`❌ Not all services found. Requested: ${services.length}, Found: ${serviceDetails.length}`);
        return res.status(404).json({
          success: false,
          error: 'One or more services not found',
          details: 'Some of the requested services do not exist'
        });
      }
      
      // Check if all services match the requested gender
      const mismatchedServices = serviceDetails.filter(
        service => service.gender.toLowerCase() !== gender.toLowerCase()
      );
      
      if (mismatchedServices.length > 0) {
        console.log(`❌ Gender mismatch for services: ${mismatchedServices.map(s => s.name).join(', ')}`);
        return res.status(400).json({
          success: false,
          error: 'Gender mismatch for services',
          details: `The following services are not available for ${gender}: ${mismatchedServices.map(s => s.name).join(', ')}`
        });
      }
      
      let totalTimeMinutes = 0;
      
      serviceDetails.forEach(service => {
        const timeString = service.time;
        let minutes = 0;
        
        // Try to parse time in format "X minutes" or "X min"
        const minutesMatch = timeString.match(/(\d+)\s*(min|minutes)/i);
        if (minutesMatch) {
          minutes = parseInt(minutesMatch[1]);
        }
        // Try to parse time in format "X hours Y minutes" or "X hr Y min"
        else {
          const hoursMatch = timeString.match(/(\d+)\s*(hr|hour|hours)/i);
          const minsMatch = timeString.match(/(\d+)\s*(min|minutes)/i);
          
          if (hoursMatch) {
            minutes += parseInt(hoursMatch[1]) * 60;
          }
          
          if (minsMatch) {
            minutes += parseInt(minsMatch[1]);
          }
        }
        
        // If no valid time format was found, try to just extract any number
        if (minutes === 0) {
          const anyNumber = timeString.match(/(\d+)/);
          if (anyNumber) {
            minutes = parseInt(anyNumber[1]);
          } else {
            // Default to 30 minutes if no number can be extracted
            console.log(`⚠️ Warning: Could not parse time format for service ${service.name}: "${timeString}". Using default of 30 minutes.`);
            minutes = 30;
          }
        }
        
        console.log(`✅ Parsed time for service ${service.name}: ${minutes} minutes from "${timeString}"`);
        totalTimeMinutes += minutes;
      });
      
      console.log(`✅ Total service time calculated: ${totalTimeMinutes} minutes`);
    
    } catch (serviceError) {
      console.error('❌ Error retrieving or processing services:', serviceError);
      return res.status(500).json({
        success: false,
        error: 'Error processing service information',
        details: process.env.NODE_ENV === 'development' ? serviceError.message : 'Unable to process service information'
      });
    }
    
    // Determine which schema to use based on gender
    const SlotsSchema = slotUtils.getSlotsModel(gender);
    
    // Time limits for each slot
    const timeConstraints = {
      morning: { hour: 12, minute: 0 }, // 12:00 PM
      afternoon: { hour: 13, minute: 30 }, // 1:30 PM
      evening: { hour: 18, minute: 0 } // 6:00 PM
    };
    
    // Check if the requested service duration can fit within the slot window considering existing appointments
    const checkSlotAvailability = async (day, timeSlot, slots, totalTimeMinutes) => {
      console.log(`\n🔍 ===== CHECKING SLOT AVAILABILITY =====`);
      console.log(`📅 Day: ${day}`);
      console.log(`⏰ Time slot: ${timeSlot}`);
      console.log(`⏱️ Total time needed: ${totalTimeMinutes} minutes`);
      
      // Validate slot array
      if (!Array.isArray(slots)) {
        console.log(`❌ Slots is not an array: ${typeof slots}`);
        return { available: false, reason: 'no_slots', details: 'Slots is not an array' };
      }
      
      if (slots.length === 0) {
        console.log(`❌ Slots array is empty for ${day} ${timeSlot}`);
        return { available: false, reason: 'no_slots', details: 'Slots array is empty' };
      }

      console.log(`📋 Slots array: ${JSON.stringify(slots)}`);

      // Check the first slot in the array
      const slot = slots[0];
      
      if (!slot) {
        console.log(`❌ First slot is undefined or null`);
        return { available: false, reason: 'invalid_slot', details: 'First slot is undefined or null' };
      }
      
      if (!slot.name) {
        console.log(`❌ Slot name is missing: ${JSON.stringify(slot)}`);
        return { available: false, reason: 'invalid_slot', details: 'Slot name is missing' };
      }
      
      if (slot.name !== "Available") {
        console.log(`❌ Slot for ${day} ${timeSlot} is not available. Name: "${slot.name}"`);
        return { available: false, reason: 'slot_unavailable', details: `Slot name is "${slot.name}" instead of "Available"` };
      }

      // Validate starting_time and ending_time
      if (!slot.starting_time || !slot.ending_time) {
        console.log(`❌ Slot time information is missing: ${JSON.stringify(slot)}`);
        return {
          available: false,
          reason: 'invalid_slot_time',
          details: 'Slot starting_time or ending_time is missing'
        };
      }
      
      let windowStart, windowEnd;
      
      try {
        windowStart = new Date(slot.starting_time);
        windowEnd = new Date(slot.ending_time);
        
        if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
          console.log(`❌ Invalid date format for slot times: Start=${slot.starting_time}, End=${slot.ending_time}`);
          return {
            available: false,
            reason: 'invalid_slot_time',
            details: 'Invalid date format for slot times'
          };
        }
        
        console.log(`📊 Slot window: ${windowStart.toLocaleTimeString()} - ${windowEnd.toLocaleTimeString()}`);
      } catch (dateError) {
        console.error(`❌ Error parsing slot dates:`, dateError);
        return {
          available: false,
          reason: 'date_parsing_error',
          details: dateError.message
        };
      }

      // Check if service duration exceeds slot capacity
      const slotDurationMinutes = (windowEnd - windowStart) / (1000 * 60);
      console.log(`📊 Slot duration: ${slotDurationMinutes} minutes`);
      console.log(`📊 Service duration: ${totalTimeMinutes} minutes`);
      
      if (totalTimeMinutes > slotDurationMinutes) {
        console.log(`❌ Service duration (${totalTimeMinutes}min) exceeds slot capacity (${slotDurationMinutes}min)`);
        return {
          available: false,
          reason: 'duration_exceeds_capacity',
          slotDuration: slotDurationMinutes,
          serviceDuration: totalTimeMinutes,
          details: `Service requires ${totalTimeMinutes} minutes but slot only has ${slotDurationMinutes} minutes available`
        };
      }

      try {
        // Fetch existing appointments for the same day and time slot
        const existing = await Appointment.find({
          day,
          timeSlot,
          status: { $in: ['booked', 'confirmed'] } // Only consider active appointments
        }).lean();
        
        console.log(`📋 Found ${existing.length} existing appointments for ${day} ${timeSlot}`);

        // Build a list of blocked intervals
        const blocked = existing.map(a => ({
          start: new Date(a.startTime),
          end: new Date(a.endTime),
          id: a._id
        }));

        // Try to place the new appointment at the earliest available time in the window
        const durationMs = totalTimeMinutes * 60 * 1000;
        let candidateStart = new Date(windowStart);

        // Sort blocked by start time to scan gaps
        blocked.sort((a, b) => a.start.getTime() - b.start.getTime());
        
        // Log existing appointments for debugging
        if (blocked.length > 0) {
          console.log('📅 Existing appointments:');
          blocked.forEach((b, i) => {
            console.log(`  ${i+1}. ${b.start.toLocaleTimeString()} - ${b.end.toLocaleTimeString()} (ID: ${b.id})`);
          });
        }

        for (const b of blocked) {
          // If candidate fits entirely before this blocked interval
          const candidateEnd = new Date(candidateStart.getTime() + durationMs);
          if (candidateEnd <= b.start && candidateStart >= windowStart) {
            console.log(`✅ Found available slot: ${candidateStart.toLocaleTimeString()} - ${candidateEnd.toLocaleTimeString()}`);
            return {
              available: true,
              start: candidateStart,
              end: candidateEnd
            };
          }
          // Move candidate start to end of this blocked interval if overlapping
          if (candidateStart < b.end) {
            candidateStart = new Date(b.end);
            console.log(`⏩ Moving candidate start time to: ${candidateStart.toLocaleTimeString()}`);
          }
          // If candidate start moved beyond window end, no availability
          if (candidateStart.getTime() + durationMs > windowEnd.getTime()) {
            console.log(`❌ No availability: candidate start (${candidateStart.toLocaleTimeString()}) + duration exceeds window end`);
            return {
              available: false,
              reason: 'no_suitable_gap'
            };
          }
        }

        // After processing all blocked intervals, try to fit at the end
        const finalEnd = new Date(candidateStart.getTime() + durationMs);
        if (candidateStart >= windowStart && finalEnd <= windowEnd) {
          console.log(`✅ Found available slot at end: ${candidateStart.toLocaleTimeString()} - ${finalEnd.toLocaleTimeString()}`);
          return {
            available: true,
            start: candidateStart,
            end: finalEnd
          };
        }
        
        console.log(`❌ No availability found after checking all options`);
        return {
          available: false,
          reason: 'no_availability'
        };
      } catch (error) {
        console.error(`❌ Error checking slot availability:`, error);
        return {
          available: false,
          reason: 'error',
          details: error.message
        };
      }
    };
    
    // Helper function to send booking response
    const sendBookingResponse = (day, timeSlot, proposed) => {
      try {
        const startTime = proposed.start;
        const endTime = proposed.end;
        
        console.log(`🎯 Sending booking response for ${day} ${timeSlot}: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
        
        const base = `${req.protocol}://${req.get('host')}`;
        
        // Format services for URL
        const servicesParam = Array.isArray(services) ? services.join(',') : '';
        
        // Create response with detailed information
        const response = {
          success: true,
          message: `A slot is available from ${startTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()} on ${day}. Please accept to confirm.`,
          appointment: {
            day: day,
            timeSlot: timeSlot,
            startTime: startTime,
            endTime: endTime,
            duration: Math.round((endTime - startTime) / (1000 * 60)) + ' minutes',
            customerName: fullName,
            customerPhone: phoneNumber,
            gender: gender,
            services: services
          },
          links: {
            accept: `${base}/api/appointments/accept?day=${encodeURIComponent(day)}&timeSlot=${encodeURIComponent(timeSlot)}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&name=${encodeURIComponent(fullName)}&phone=${encodeURIComponent(phoneNumber)}&gender=${encodeURIComponent(gender)}&services=${encodeURIComponent(servicesParam)}`,
            decline: `${base}/api/appointments/decline?name=${encodeURIComponent(fullName)}&day=${encodeURIComponent(day)}&timeSlot=${encodeURIComponent(timeSlot)}`
          }
        };
        
        return res.json(response);
      } catch (error) {
        console.error('❌ Error generating booking response:', error);
        return res.status(500).json({
          success: false,
          error: 'Error generating booking response',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
      }
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
      
      const result = await checkSlotAvailability(preferredDay, preferredTime, slots, totalTimeMinutes);
      
      if (!result.available) {
        console.log(`❌ No availability for ${preferredDay} ${preferredTime}: ${result.reason}`);
        
        // Handle different reasons for unavailability
        if (result.reason === 'duration_exceeds_capacity') {
          return res.json({
            success: false,
            error: 'duration_exceeds_capacity',
            message: `Selected services require ${result.serviceDuration} minutes, but ${preferredDay} ${preferredTime} slot only has ${result.slotDuration} minutes available. Please choose fewer services or a different time slot.`
          });
        } else if (result.reason === 'no_slots') {
          return res.json({
            success: false,
            error: 'no_slots',
            message: `No slot configuration found for ${preferredDay} ${preferredTime}.`
          });
        } else if (result.reason === 'slot_unavailable') {
          return res.json({
            success: false,
            error: 'slot_unavailable',
            message: `The ${preferredTime} slot on ${preferredDay} is not available for booking.`
          });
        } else if (result.reason === 'error') {
          return res.status(500).json({
            success: false,
            error: 'system_error',
            message: `An error occurred while checking availability: ${result.details || 'Unknown error'}`
          });
        } else {
          return res.json({
            success: false,
            error: 'no_availability',
            message: `No available time found within ${preferredDay} ${preferredTime} due to existing bookings.`
          });
        }
      }
      
      return sendBookingResponse(preferredDay, preferredTime, result);
    }
    
    // Case 2: Any day but specific slot
    else if (preferredDay === 'Anyday' && preferredTime !== 'anytime') {
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      for (const day of weekDays) {
        const daySlot = await SlotsSchema.findOne({ day: day });
        
        if (daySlot) {
          const slots = daySlot[preferredTime];
          
          const result = await checkSlotAvailability(day, preferredTime, slots, totalTimeMinutes);
          if (result.available) {
            return sendBookingResponse(day, preferredTime, result);
          }
          
          // Log the reason for unavailability
          if (result.reason === 'duration_exceeds_capacity') {
            console.log(`⚠️ ${day} ${preferredTime}: Service duration (${result.serviceDuration}min) exceeds slot capacity (${result.slotDuration}min)`);
          } else {
            console.log(`⚠️ ${day} ${preferredTime}: Not available - ${result.reason}`);
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
            
            const result = await checkSlotAvailability(day, timeSlot, slots, totalTimeMinutes);
            if (result.available) {
              return sendBookingResponse(day, timeSlot, result);
            }
            
            // Log the reason for unavailability
            console.log(`⚠️ ${day} ${timeSlot}: Not available - ${result.reason}`);
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
        
        const result = await checkSlotAvailability(preferredDay, timeSlot, slots, totalTimeMinutes);
        if (result.available) {
          return sendBookingResponse(preferredDay, timeSlot, result);
        }
        
        // Log the reason for unavailability
        console.log(`⚠️ ${preferredDay} ${timeSlot}: Not available - ${result.reason}`);
      }
      
      return res.json({ 
        success: false,
        message: `No slots available for ${preferredDay}` 
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in book appointment:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message based on error type
    let errorMessage = 'Internal server error while booking appointment';
    let errorDetails = 'Please try again later';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error in booking data';
      errorDetails = error.message;
    } else if (error.name === 'TypeError') {
      errorMessage = 'Type error in booking process';
      errorDetails = error.message;
    } else if (error.name === 'ReferenceError') {
      errorMessage = 'Reference error in booking process';
      errorDetails = error.message;
    } else if (error.message.includes('time')) {
      errorMessage = 'Error processing service time';
      errorDetails = error.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' || true ? errorDetails : 'Please try again later'
    });
  }
});

// Function to check and reset slots (automated version)
const checkAndResetSlots = async () => {
  console.log(`\n🔄 ===== AUTOMATED SLOT RESET CHECK =====`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    console.log(`📆 Current day of week: ${dayOfWeek} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);
    
    if (dayOfWeek === 0) { // Sunday
      console.log(`🔄 Today is Sunday - proceeding with weekly slot reset`);
      
      // Use the utility function to create weekly slots
      const result = await slotUtils.createWeeklySlots();
      
      console.log(`🎉 Weekly slot reset completed successfully`);
      return result;
    } else {
      console.log(`ℹ️ Today is not Sunday - no reset needed`);
      return {
        success: true,
        message: 'Today is not Sunday, no reset needed',
        currentDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        nextResetDay: 'Sunday'
      };
    }
  } catch (error) {
    console.error('❌ Error checking/resetting slots:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    return {
      success: false,
      error: 'Error resetting slots',
      details: error.message
    };
  }
};

// Set up interval to check slots every day (in milliseconds)
const ONE_DAY = 24 * 60 * 60 * 1000;  // 86400000 milliseconds (24 hours)

// Run initial check when server starts
console.log('🚀 Running initial slot check on server startup...');
checkAndResetSlots()
  .then(result => {
    console.log('✅ Initial slot check completed:', result.message);
  })
  .catch(error => {
    console.error('❌ Initial slot check failed:', error);
  });

// Set up the interval after initial check
let intervalId = setInterval(async () => {
  console.log('⏰ Running scheduled slot check...');
  try {
    const result = await checkAndResetSlots();
    console.log('✅ Scheduled slot check completed:', result.message);
  } catch (error) {
    console.error('❌ Scheduled slot check failed:', error);
  }
}, ONE_DAY);

// Log next check time
console.log('📅 Next scheduled slot check will be at:', new Date(Date.now() + ONE_DAY).toLocaleString());

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
