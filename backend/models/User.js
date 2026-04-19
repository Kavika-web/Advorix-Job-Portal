const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  // Basic Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
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
  phone: {
    type: String,
    default: ''
  },

  // Profile
  jobTitle: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  resumeUrl: {
    type: String,
    default: ''
  },

  // Role
  role: {
    type: String,
    enum: ['candidate', 'admin'],
    default: 'candidate'
  },

  // Timestamps
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);