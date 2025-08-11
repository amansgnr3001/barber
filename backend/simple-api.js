import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key';

// Authentication middleware
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

// Mock data for services
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
  },
  {
    _id: '5',
    name: 'Kids Haircut',
    price: 20,
    time: '25 minutes',
    gender: 'male'
  },
  {
    _id: '6',
    name: 'Women Haircut',
    price: 35,
    time: '40 minutes',
    gender: 'female'
  }
];

// Initialize mock customers - we'll populate this after hashing passwords
let mockCustomers = [];

// Initialize customers with proper password hashing
const initializeCustomers = async () => {
  const customers = [
    {
      _id: '1',
      name: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      plainPassword: 'password123'
    },
    {
      _id: '2',
      name: 'Test User',
      email: 'test@test.com',
      plainPassword: 'test123'
    }
  ];

  for (const customer of customers) {
    const hashedPassword = await bcrypt.hash(customer.plainPassword, 10);
    mockCustomers.push({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      password: hashedPassword
    });
  }

  console.log('✅ Mock customers initialized with hashed passwords');
};

// Initialize customers when server starts
initializeCustomers();

// Helper function to create password hash (for testing)
const createPasswordHash = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test password hash endpoint
app.get('/test-password/:password', async (req, res) => {
  try {
    const { password } = req.params;
    const hash = await createPasswordHash(password);
    const testResult = await bcrypt.compare(password, hash);

    // Test against existing hash
    const existingHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const existingTest = await bcrypt.compare(password, existingHash);

    res.json({
      password,
      newHash: hash,
      newHashTest: testResult,
      existingHashTest: existingTest,
      existingHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // Check if customer exists
    const customer = mockCustomers.find(c => c.email === email);
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
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Gender-based services endpoint
app.get('/api/services/:gender', (req, res) => {
  try {
    const { gender } = req.params;
    
    // Validate gender parameter
    if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid gender parameter. Must be "male" or "female"' 
      });
    }
    
    // Filter services by gender
    const services = mockServices.filter(service => 
      service.gender.toLowerCase() === gender.toLowerCase()
    );
    
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

// All services endpoint
app.get('/api/services', (req, res) => {
  res.json(mockServices);
});

// Book appointment endpoint
app.post('/api/book-appointment', authenticateToken, async (req, res) => {
  try {
    const { fullName, phoneNumber, gender, preferredDay, preferredTime, services } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !gender || !preferredDay || !preferredTime || !services || services.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Get service details and calculate total time
    const serviceDetails = mockServices.filter(service => services.includes(service._id));
    let totalTimeMinutes = 0;

    serviceDetails.forEach(service => {
      const timeString = service.time;
      const minutes = parseInt(timeString.split(' ')[0]);
      totalTimeMinutes += minutes;
    });

    // For demo purposes, simulate finding an available slot
    const timeSlots = {
      'morning': { start: '09:00', end: '12:00' },
      'afternoon': { start: '12:00', end: '14:00' },
      'evening': { start: '14:00', end: '18:00' }
    };

    const selectedTimeSlot = preferredTime === 'anytime' ? 'morning' : preferredTime;
    const selectedDay = preferredDay === 'Anyday' ? 'Monday' : preferredDay;

    // Create proposed appointment time
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(parseInt(timeSlots[selectedTimeSlot].start.split(':')[0]), 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + totalTimeMinutes);

    // Generate accept/decline links
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const acceptParams = new URLSearchParams({
      day: selectedDay,
      timeSlot: selectedTimeSlot,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      name: fullName,
      phone: phoneNumber,
      gender: gender,
      services: services.join(',')
    });

    const response = {
      success: true,
      message: `A slot is available from ${startTime.toLocaleTimeString()} to ${endTime.toLocaleTimeString()} on ${selectedDay}. Please accept to confirm.`,
      appointment: {
        day: selectedDay,
        timeSlot: selectedTimeSlot,
        startTime: startTime,
        endTime: endTime
      },
      links: {
        accept: `${baseUrl}/api/appointments/accept?${acceptParams.toString()}`,
        decline: `${baseUrl}/api/appointments/decline`
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error booking appointment'
    });
  }
});

// Accept appointment endpoint
app.get('/api/appointments/accept', (req, res) => {
  const { day, timeSlot, start, end, name, phone, gender, services } = req.query;

  // In a real app, you would save this to a database
  console.log('Appointment accepted:', { day, timeSlot, start, end, name, phone, gender, services });

  res.json({
    success: true,
    message: 'Appointment confirmed successfully!',
    appointment: {
      customerName: name,
      customerPhone: phone,
      gender: gender,
      day: day,
      timeSlot: timeSlot,
      startTime: start,
      endTime: end,
      services: services ? services.split(',') : [],
      status: 'confirmed'
    }
  });
});

// Decline appointment endpoint
app.get('/api/appointments/decline', (req, res) => {
  res.json({
    success: true,
    message: 'Appointment declined. The slot has been released.'
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Test the server at: http://localhost:${PORT}/test`);
  console.log(`🔐 Login API at: http://localhost:${PORT}/api/login`);
  console.log(`🎯 Gender-based services API at: http://localhost:${PORT}/api/services/:gender`);
  console.log(`📋 All services API at: http://localhost:${PORT}/api/services`);
  console.log(`📅 Book appointment API at: http://localhost:${PORT}/api/book-appointment`);
});

export default app;
