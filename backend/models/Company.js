const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({

  // Basic Info
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },

  // Profile
  industry: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },

  // Status
  isApproved: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'company'
  }

}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);