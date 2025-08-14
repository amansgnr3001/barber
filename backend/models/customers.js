import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone_number: {
    type: String,
    required: true,
    trim: true,
    match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },
  dateOfBirth: {
    type: Date
  },
  customerType: {
    type: String,
    enum: ['regular', 'student', 'senior', 'vip'],
    default: 'regular'
  },
  // Student-specific fields (now optional)
  enrollment_number: {
    type: String,
    required: function() { return this.customerType === 'student'; }
  },
  course: {
    type: String,
    required: function() { return this.customerType === 'student'; }
  },
  year: {
    type: String,
    required: function() { return this.customerType === 'student'; }
  },
  // Additional fields
  preferences: {
    preferredBarber: { type: String },
    preferredServices: [{ type: String }],
    notes: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ phone_number: 1 });

export default mongoose.model('Customer', customerSchema);