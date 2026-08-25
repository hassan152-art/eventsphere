const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    category: {
      type: String,
      enum: ['Cultural Events', 'Technical Fests', 'Sports Meets', 'Annual Day', 'Workshops', 'Seminars', 'Competitions'],
      required: true,
    },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    caption: { type: String, default: '' },
    year: { type: Number, default: () => new Date().getFullYear() },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  },
  { timestamps: true }
);

mediaSchema.index({ category: 1, year: 1 });

module.exports = mongoose.model('Media', mediaSchema);
