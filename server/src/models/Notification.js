const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'New Event', 'Registration Confirmation', 'Registration Cancellation',
        'Event Reminder', 'Venue Change', 'Schedule Change', 'Event Cancellation',
        'Waitlist Promotion', 'Attendance Confirmation', 'Certificate Available',
        'Admin Announcement', 'Event Approval Update',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
