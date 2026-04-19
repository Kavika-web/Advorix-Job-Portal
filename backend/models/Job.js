const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({

  // Job Info
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  jobType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'],
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  salary: {
    type: String,
    default: 'Not specified'
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date,
    default: null
  },

  // Who posted this job
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },

  // Admin approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // How many applied
  applicantsCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);