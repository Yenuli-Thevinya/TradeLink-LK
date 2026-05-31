const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'Painting', 'Joinery', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^\+94[0-9]{9}$/, 'Please enter a valid Sri Lanka phone number'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
    },
    assignedWorker: {
      name: { type: String, trim: true },
      phone: {
        type: String,
        trim: true,
        match: [/^\+94[0-9]{9}$/, 'Please enter a valid Sri Lanka phone number'],
      },
    },
    feedback: {
      comment: { type: String, trim: true },
      rating: { type: Number, min: 1, max: 5 },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRequest', jobRequestSchema);