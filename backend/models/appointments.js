import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  timeSlot: { type: String, required: true, enum: ['morning', 'afternoon', 'evening'] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Services' }],
  status: { type: String, required: true, enum: ['booked'], default: 'booked' },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);


