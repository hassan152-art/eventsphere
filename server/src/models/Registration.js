const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
      type: String,
      enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
      default: 'Confirmed',
      index: true,
    },
    waitlistPosition: { type: Number, default: null },

    // Secure, unique token embedded in the participant's QR pass.
    attendanceToken: { type: String, required: true, unique: true, default: () => crypto.randomBytes(24).toString('hex') },

    registeredAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate active registrations for the same event + student
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
