import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key';

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

// Mock customers with hashed passwords
const mockCustomers = [
  {
    _id: '1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password123
  }
];

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Test the server at: http://localhost:${PORT}/test`);
  console.log(`🔐 Login API at: http://localhost:${PORT}/api/login`);
  console.log(`🎯 Gender-based services API at: http://localhost:${PORT}/api/services/:gender`);
  console.log(`📋 All services API at: http://localhost:${PORT}/api/services`);
});

export default app;
