import mongoose from 'mongoose';

const servicesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cost: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
    default: 'male'
  }
});

export default mongoose.model('Services', servicesSchema);