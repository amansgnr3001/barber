import mongoose from 'mongoose';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/barber', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const makeSlot = (hour, minute) => [{
  name: "Available",
  starting_time: new Date(2000, 0, 1, hour, minute),
  ending_time: new Date(2000, 0, 1, hour, minute)
}];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const slotsData = days.map(day => ({
  day,
  morning: makeSlot(9, 0),
  afternoon: makeSlot(12, 0),
  evening: makeSlot(14, 30)
}));

const seed = async () => {
  try {
    await Slots.deleteMany({});
    await Slots1.deleteMany({});
    await Slots.insertMany(slotsData);
    await Slots1.insertMany(slotsData);
    console.log('Seeded slots for Monday to Friday.');
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
};

seed();
