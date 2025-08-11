import mongoose from 'mongoose';
import Slots from './models/slots.js';
import Slots1 from './models/slots1.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/barber', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const makeSlotRange = (startHour, startMinute, endHour, endMinute, name = 'Available') => [{
  name,
  starting_time: new Date(2000, 0, 1, startHour, startMinute),
  ending_time: new Date(2000, 0, 1, endHour, endMinute)
}];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const slotsDataMale = days.map(day => ({
  day,
  morning: makeSlotRange(9, 0, 12, 0, 'Available'),
  afternoon: makeSlotRange(12, 0, 13, 30, 'Available'),
  evening: makeSlotRange(14, 30, 18, 0, 'Available')
}));

// For female (slots1), keep Available as well; booked times come from Appointments
const slotsDataFemale = days.map(day => ({
  day,
  morning: makeSlotRange(9, 0, 12, 0, 'Available'),
  afternoon: makeSlotRange(12, 0, 13, 30, 'Available'),
  evening: makeSlotRange(14, 30, 18, 0, 'Available')
}));

const seed = async () => {
  try {
    await Slots.deleteMany({});
    await Slots1.deleteMany({});
    await Slots.insertMany(slotsDataMale);
    await Slots1.insertMany(slotsDataFemale);
    console.log('Seeded slots (Mon–Fri). Male & Female windows set to Available. Use Appointments for conflicts.');
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
};

seed();
