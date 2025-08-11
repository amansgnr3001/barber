import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

// Gender-based services endpoint
app.get('/api/services/:gender', (req, res) => {
  const { gender } = req.params;
  
  if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Invalid gender parameter. Must be "male" or "female"' 
    });
  }
  
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
  
  const services = mockServices.filter(service => 
    service.gender.toLowerCase() === gender.toLowerCase()
  );
  
  res.json({
    success: true,
    gender: gender.toLowerCase(),
    count: services.length,
    services: services
  });
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Gender-based services API at: http://localhost:${PORT}/api/services/:gender`);
});
