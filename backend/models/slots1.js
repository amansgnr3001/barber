import mongoose from 'mongoose';


const schema = new mongoose.Schema({
  day: {
    type: String
  },
  morning: {
    type: [{
      name: {
        type: String,
        required: true
      },
      starting_time: {
        type: Date,
        required: true
      },
      ending_time: {
        type: Date,
        required: true
      }
    }],
    default: function() {
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      return [{
        name: "Available",
        starting_time: date,
        ending_time: date
      }];
    }
  },
  afternoon: {
    type: [{
      name: {
        type: String,
        required: true
      },
      starting_time: {
        type: Date,
        required: true
      },
      ending_time: {
        type: Date,
        required: true
      }
    }],
    default: function() {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      return [{
        name: "Available",
        starting_time: date,
        ending_time: date
      }];
    }
  },
  evening: {
    type: [{
      name: {
        type: String,
        required: true
      },
      starting_time: {
        type: Date,
        required: true
      },
      ending_time: {
        type: Date,
        required: true
      }
    }],
    default: function() {
      const date = new Date();
      date.setHours(14, 30, 0, 0);
      return [{
        name: "Available",
        starting_time: date,
        ending_time: date
      }];
    }
  }
});

export default mongoose.model('slots1', schema);