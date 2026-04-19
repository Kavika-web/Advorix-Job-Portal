const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, adminOnly } = require('../middleware/auth');

// ─────────────────────────────────────────
// @route   POST /api/jobs
// @desc    Company posts a new job
// @access  Private (Company only)
// ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, requirements,
      category, jobType, location,
      salary, skills, experience, deadline
    } = req.body;

    // Only companies can post jobs
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can post jobs'
      });
    }

    // Get company info
    const Company = require('../models/Company');
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements || '',
      category,
      jobType,
      location,
      salary: salary || 'Not specified',
      skills: skills || [],
      experience: experience || '',
      deadline: deadline || null,
      company: company._id,
      companyName: company.companyName,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Job submitted for approval!',
      job
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
// @route   GET /api/jobs
// @desc    Get all approved jobs
// @access  Public
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, jobType, search } = req.query;

    // Build filter
    let filter = { status: 'approved' };

    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
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
// @route   GET /api/jobs/my-jobs
// @desc    Company gets their own jobs
// @access  Private (Company only)
// ─────────────────────────────────────────
router.get('/my-jobs', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const jobs = await Job.find({ company: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
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
// @route   GET /api/jobs/pending
// @desc    Admin gets all pending jobs
// @access  Private (Admin only)
// ─────────────────────────────────────────
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
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
// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
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
// @route   PUT /api/jobs/:id
// @desc    Company updates their job
// @access  Private (Company only)
// ─────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure company owns this job
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: 'pending' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Job updated and resubmitted for approval',
      job: updatedJob
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
// @route   DELETE /api/jobs/:id
// @desc    Company deletes their job
// @access  Private (Company or Admin)
// ─────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only owner company or admin can delete
    if (job.company.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
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
// @route   PUT /api/jobs/:id/approve
// @desc    Admin approves or rejects a job
// @access  Private (Admin only)
// ─────────────────────────────────────────
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: `Job ${status} successfully`,
      job
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
// @route   POST /api/jobs/:id/apply
// @desc    Candidate applies for a job
// @access  Private (Candidate only)
// ─────────────────────────────────────────
router.post('/:id/apply', protect, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can apply for jobs'
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This job is not available'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user.id,
      job: job._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get user resume
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    // Create application
    const application = await Application.create({
      user: req.user.id,
      job: job._id,
      company: job.company,
      coverLetter: req.body.coverLetter || '',
      resumeUrl: user.resumeUrl || ''
    });

    // Update applicants count
    await Job.findByIdAndUpdate(req.params.id, {
      $inc: { applicantsCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────
// @route   GET /api/jobs/:id/applicants
// @desc    Company views applicants for a job
// @access  Private (Company only)
// ─────────────────────────────────────────
router.get('/:id/applicants', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('user', 'firstName lastName email phone skills resumeUrl')
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

module.exports = router;