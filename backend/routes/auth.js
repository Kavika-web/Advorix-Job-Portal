const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register/candidate
// @desc    Register a new candidate
// @access  Public
// ─────────────────────────────────────────
router.post('/register/candidate', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check all fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || ''
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────
// @route   POST /api/auth/register/company
// @desc    Register a new company
// @access  Public
// ─────────────────────────────────────────
router.post('/register/company', async (req, res) => {
  try {
    const { companyName, email, password, industry, website } = req.body;

    // Check all fields
    if (!companyName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create company
    const company = await Company.create({
      companyName,
      email,
      password: hashedPassword,
      industry: industry || '',
      website: website || ''
    });

    const token = generateToken(company._id, 'company');

    res.status(201).json({
      success: true,
      message: 'Company registered successfully!',
      token,
      user: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        role: 'company',
        isApproved: company.isApproved
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login for all roles
// @access  Public
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password and role'
      });
    }

    let account = null;
    let accountRole = role;

    // Find account based on role
    if (role === 'candidate' || role === 'admin') {
      account = await User.findOne({ email });
    } else if (role === 'company') {
      account = await Company.findOne({ email });
    }

    // Check account exists
    if (!account) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check admin role matches
    if (role === 'admin' && account.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const token = generateToken(account._id, accountRole);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: account._id,
        email: account.email,
        role: accountRole,
        name: account.firstName
          ? `${account.firstName} ${account.lastName}`
          : account.companyName
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;