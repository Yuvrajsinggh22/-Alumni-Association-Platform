const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin, requireAdminRole } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Admin login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...adminData } = admin;

    res.json({
      message: 'Admin login successful',
      admin: adminData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create admin (Super Admin only)
router.post('/create', authenticateAdmin, requireAdminRole(['SUPER_ADMIN']), validate(schemas.admin), async (req, res) => {
  try {
    const { email, password, name, role } = req.validatedData;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Get pending alumni verifications
router.get('/alumni/pending', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where: { isVerified: false },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          graduationYear: true,
          department: true,
          degree: true,
          currentJob: true,
          currentCompany: true,
          location: true,
          bio: true,
          skills: true,
          interests: true,
          linkedinUrl: true,
          githubUrl: true,
          websiteUrl: true,
          createdAt: true
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.alumni.count({ where: { isVerified: false } })
    ]);

    res.json({
      alumni,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Pending alumni fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pending alumni' });
  }
});

// Verify/Reject alumni
router.put('/alumni/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    const alumni = await prisma.alumni.findUnique({
      where: { id },
      select: { name: true, email: true, isVerified: true }
    });

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    if (alumni.isVerified) {
      return res.status(400).json({ error: 'Alumni already verified' });
    }

    if (action === 'approve') {
      await prisma.alumni.update({
        where: { id },
        data: { isVerified: true }
      });

      res.json({
        message: `${alumni.name} has been verified successfully`
      });
    } else {
      // For rejection, you might want to delete the record or mark as rejected
      await prisma.alumni.delete({
        where: { id }
      });

      res.json({
        message: `${alumni.name}'s application has been rejected`
      });
    }
  } catch (error) {
    console.error('Alumni verification error:', error);
    res.status(500).json({ error: 'Failed to process verification' });
  }
});

// Get all feedback (Admin)
router.get('/feedback', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          alumni: {
            select: {
              id: true,
              name: true,
              email: true,
              graduationYear: true,
              department: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Update feedback status
router.put('/feedback/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status },
      include: {
        alumni: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Feedback status updated',
      feedback
    });
  } catch (error) {
    console.error('Feedback status update error:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// Get success stories pending approval
router.get('/success-stories/pending', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [stories, total] = await Promise.all([
      prisma.successStory.findMany({
        where: { isApproved: false },
        include: {
          alumni: {
            select: {
              id: true,
              name: true,
              email: true,
              graduationYear: true,
              department: true,
              currentJob: true,
              currentCompany: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.successStory.count({ where: { isApproved: false } })
    ]);

    res.json({
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Pending stories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pending success stories' });
  }
});

// Approve/Reject success story
router.put('/success-stories/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const story = await prisma.successStory.findUnique({
      where: { id },
      include: {
        alumni: { select: { name: true } }
      }
    });

    if (!story) {
      return res.status(404).json({ error: 'Success story not found' });
    }

    if (action === 'approve') {
      await prisma.successStory.update({
        where: { id },
        data: { isApproved: true }
      });

      res.json({
        message: `Success story by ${story.alumni.name} approved`
      });
    } else {
      await prisma.successStory.delete({
        where: { id }
      });

      res.json({
        message: `Success story by ${story.alumni.name} rejected`
      });
    }
  } catch (error) {
    console.error('Success story approval error:', error);
    res.status(500).json({ error: 'Failed to process success story' });
  }
});

// Get platform statistics
router.get('/stats/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalAlumni,
      verifiedAlumni,
      pendingAlumni,
      totalJobs,
      activeJobs,
      totalEvents,
      upcomingEvents,
      totalDonations,
      completedDonations,
      totalFeedback,
      openFeedback,
      recentRegistrations
    ] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.count({ where: { isVerified: true } }),
      prisma.alumni.count({ where: { isVerified: false } }),
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.event.count(),
      prisma.event.count({ 
        where: { 
          isActive: true,
          eventDate: { gte: new Date() }
        }
      }),
      prisma.donation.count(),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: 'OPEN' } }),
      prisma.alumni.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    res.json({
      alumni: {
        total: totalAlumni,
        verified: verifiedAlumni,
        pending: pendingAlumni
      },
      jobs: {
        total: totalJobs,
        active: activeJobs
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents
      },
      donations: {
        total: totalDonations,
        completed: completedDonations
      },
      feedback: {
        total: totalFeedback,
        open: openFeedback
      },
      recentRegistrations
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
