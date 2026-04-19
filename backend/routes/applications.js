const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────
// @route   GET /api/applications/my-applications
// @desc    Candidate gets their applications
// @access  Private (Candidate only)
// ─────────────────────────────────────────
router.get('/my-applications', protect, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title companyName location jobType salary')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
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
// @route   PUT /api/applications/:id/status
// @desc    Company updates application status
// @access  Private (Company only)
// ─────────────────────────────────────────
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status } = req.body;

    const validStatuses = [
      'applied', 'under_review', 'shortlisted', 'rejected'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      application
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