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
      const start = new Date();
      start.setHours(9, 0, 0, 0);
      const end = new Date();
      end.setHours(12, 0, 0, 0); // 9:00 → 12:00
      return [{
        name: "Available",
        starting_time: start,
        ending_time: end
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
      const start = new Date();
      start.setHours(12, 0, 0, 0);
      const end = new Date();
      end.setHours(13, 30, 0, 0); // 12:00 → 13:30
      return [{
        name: "Available",
        starting_time: start,
        ending_time: end
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
      const start = new Date();
      start.setHours(14, 30, 0, 0);
      const end = new Date();
      end.setHours(18, 0, 0, 0); // 14:30 → 18:00
      return [{
        name: "Available",
        starting_time: start,
        ending_time: end
      }];
    }
  }
});

const Schedule = mongoose.model('Schedule', schema);

// Dummy data for Monday through Friday
const dummyData = [
  {
    day: "Monday",
    morning: [
      {
        name: "John Smith - Haircut",
        starting_time: new Date(2024, 0, 8, 9, 0, 0), // 9:00 AM
        ending_time: new Date(2024, 0, 8, 10, 0, 0)   // 10:00 AM
      }
    ],
    afternoon: [
      {
        name: "Sarah Johnson - Beard Trim",
        starting_time: new Date(2024, 0, 8, 12, 30, 0), // 12:30 PM
        ending_time: new Date(2024, 0, 8, 13, 0, 0)     // 1:00 PM
      }
    ],
    evening: [
      {
        name: "Mike Davis - Full Service",
        starting_time: new Date(2024, 0, 8, 15, 0, 0), // 3:00 PM
        ending_time: new Date(2024, 0, 8, 16, 30, 0)   // 4:30 PM
      }
    ]
  },
  {
    day: "Tuesday",
    morning: [
      {
        name: "Emily Wilson - Styling",
        starting_time: new Date(2024, 0, 9, 9, 30, 0), // 9:30 AM
        ending_time: new Date(2024, 0, 9, 11, 0, 0)    // 11:00 AM
      }
    ],
    afternoon: [
      {
        name: "Robert Brown - Haircut",
        starting_time: new Date(2024, 0, 9, 12, 0, 0), // 12:00 PM
        ending_time: new Date(2024, 0, 9, 12, 45, 0)   // 12:45 PM
      }
    ],
    evening: [
      {
        name: "Lisa Garcia - Color Treatment",
        starting_time: new Date(2024, 0, 9, 14, 30, 0), // 2:30 PM
        ending_time: new Date(2024, 0, 9, 16, 0, 0)     // 4:00 PM
      }
    ]
  },
  {
    day: "Wednesday",
    morning: [
      {
        name: "David Miller - Beard Styling",
        starting_time: new Date(2024, 0, 10, 10, 0, 0), // 10:00 AM
        ending_time: new Date(2024, 0, 10, 10, 45, 0)   // 10:45 AM
      }
    ],
    afternoon: [
      {
        name: "Jennifer Taylor - Haircut & Style",
        starting_time: new Date(2024, 0, 10, 13, 0, 0), // 1:00 PM
        ending_time: new Date(2024, 0, 10, 13, 30, 0)   // 1:30 PM
      }
    ],
    evening: [
      {
        name: "Chris Anderson - Premium Cut",
        starting_time: new Date(2024, 0, 10, 15, 30, 0), // 3:30 PM
        ending_time: new Date(2024, 0, 10, 17, 0, 0)     // 5:00 PM
      }
    ]
  },
  {
    day: "Thursday",
    morning: [
      {
        name: "Amanda White - Wash & Cut",
        starting_time: new Date(2024, 0, 11, 9, 15, 0), // 9:15 AM
        ending_time: new Date(2024, 0, 11, 10, 30, 0)   // 10:30 AM
      }
    ],
    afternoon: [
      {
        name: "Kevin Martinez - Beard Trim",
        starting_time: new Date(2024, 0, 11, 12, 15, 0), // 12:15 PM
        ending_time: new Date(2024, 0, 11, 12, 45, 0)    // 12:45 PM
      }
    ],
    evening: [
      {
        name: "Rachel Thompson - Full Package",
        starting_time: new Date(2024, 0, 11, 16, 0, 0), // 4:00 PM
        ending_time: new Date(2024, 0, 11, 17, 30, 0)   // 5:30 PM
      }
    ]
  },
  {
    day: "Friday",
    morning: [
      {
        name: "Mark Johnson - Quick Trim",
        starting_time: new Date(2024, 0, 12, 10, 30, 0), // 10:30 AM
        ending_time: new Date(2024, 0, 12, 11, 0, 0)     // 11:00 AM
      }
    ],
    afternoon: [
      {
        name: "Nicole Rodriguez - Styling",
        starting_time: new Date(2024, 0, 12, 12, 45, 0), // 12:45 PM
        ending_time: new Date(2024, 0, 12, 13, 30, 0)    // 1:30 PM
      }
    ],
    evening: [
      {
        name: "Tom Wilson - Haircut & Shave",
        starting_time: new Date(2024, 0, 12, 15, 15, 0), // 3:15 PM
        ending_time: new Date(2024, 0, 12, 16, 45, 0)    // 4:45 PM
      }
    ]
  }
];

export default Schedule;
export { dummyData };