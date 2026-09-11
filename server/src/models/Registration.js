const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Waitlisted', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    waitlistPosition: { type: Number, default: null },

    // Secure, unique token embedded in the participant's QR pass.
    attendanceToken: { type: String, required: true, unique: true, default: () => crypto.randomBytes(24).toString('hex') },

    // Optional extra details collected by a custom registration form (e.g.
    // roll number, phone, semester) for events that want more than the
    // student's account profile already provides. Not required - plain
    // account-based registrations leave this unset.
    walkInDetails: {
      fullName: String,
      email: String,
      rollNumber: String,
      phone: String,
      department: String,
      semester: String,
    },

    registeredAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate active registrations for the same event + student
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
