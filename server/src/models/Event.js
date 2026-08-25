const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema(
  {
    time: String,
    title: String,
    description: String,
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    rules: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    eventType: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Annual Day', 'Intercollegiate'],
      required: true,
    },

    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    registrationDeadline: { type: Date, required: true },
    schedule: [scheduleItemSchema],

    venue: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },

    maxParticipants: { type: Number, required: true, min: 1 },
    seatsRemaining: { type: Number, required: true, min: 0 },
    eligibility: { type: String, default: 'Open to all students' },
    waitlistEnabled: { type: Boolean, default: true },

    bannerUrl: { type: String, default: '' },
    images: [{ type: String }],
    rulebookUrl: { type: String, default: '' },

    certificateFee: { type: Number, default: 0 }, // placeholder only, no real payment processing
    certificateFeeEnabled: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Changes Requested', 'Cancelled'],
      default: 'Pending Approval',
      index: true,
    },
    computedStatus: {
      // derived: Upcoming / Ongoing / Completed / Cancelled - kept denormalized for fast filtering
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
      index: true,
    },
    approvalNote: { type: String, default: '' },

    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    viewCount: { type: Number, default: 0 },
    registrationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1, department: 1, computedStatus: 1 });

eventSchema.methods.recomputeStatus = function recomputeStatus() {
  if (this.status === 'Cancelled') {
    this.computedStatus = 'Cancelled';
    return;
  }
  const now = new Date();
  const eventDate = new Date(this.date);
  const endOfEventDay = new Date(eventDate);
  endOfEventDay.setHours(23, 59, 59, 999);

  if (now < eventDate) this.computedStatus = 'Upcoming';
  else if (now >= eventDate && now <= endOfEventDay) this.computedStatus = 'Ongoing';
  else this.computedStatus = 'Completed';
};

module.exports = mongoose.model('Event', eventSchema);
