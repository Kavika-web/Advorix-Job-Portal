const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({

  // Who applied
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which job
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  // Which company
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Application status
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'rejected'],
    default: 'applied'
  },

  // Cover letter (optional)
  coverLetter: {
    type: String,
    default: ''
  },

  // Resume at time of apply
  resumeUrl: {
    type: String,
    default: ''
  }

}, { timestamps: true });

// Prevent same user applying to same job twice
ApplicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);