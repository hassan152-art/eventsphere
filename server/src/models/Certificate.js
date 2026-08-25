const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    certificateUrl: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Participation', 'Winner', 'Runner-up', 'Volunteer'], default: 'Participation' },

    feeStatus: { type: String, enum: ['Not Applicable', 'Pending', 'Waived'], default: 'Not Applicable' },

    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
