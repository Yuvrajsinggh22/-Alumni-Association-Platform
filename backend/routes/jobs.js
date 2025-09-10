const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all jobs with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      jobType,
      experienceLevel,
      location,
      skills,
      company,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      where.skills = { hasSome: skillsArray };
    }

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              currentCompany: true,
              graduationYear: true,
              department: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take,
        orderBy
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            currentCompany: true,
            graduationYear: true,
            department: true,
            linkedinUrl: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!job || !job.isActive) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if current user has applied
    let hasApplied = false;
    if (req.user) {
      const application = await prisma.jobApplication.findUnique({
        where: {
          jobId_alumniId: {
            jobId: id,
            alumniId: req.user.id
          }
        }
      });
      hasApplied = !!application;
    }

    res.json({
      job: {
        ...job,
        hasApplied
      }
    });
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create new job
router.post('/', authenticateToken, requireVerification, validate(schemas.job), async (req, res) => {
  try {
    const job = await prisma.job.create({
      data: {
        ...req.validatedData,
        postedById: req.user.id
      },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            currentCompany: true,
            graduationYear: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', authenticateToken, requireVerification, validate(schemas.job), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and user owns it
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { postedById: true }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (existingJob.postedById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const job = await prisma.job.update({
      where: { id },
      data: req.validatedData,
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            currentCompany: true,
            graduationYear: true,
            department: true
          }
        }
      }
    });

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and user owns it
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { postedById: true }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (existingJob.postedById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await prisma.job.delete({
      where: { id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Apply for job
router.post('/:id/apply', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id },
      select: { 
        id: true, 
        title: true, 
        isActive: true, 
        postedById: true,
        postedBy: {
          select: { name: true }
        }
      }
    });

    if (!job || !job.isActive) {
      return res.status(404).json({ error: 'Job not found or inactive' });
    }

    // Check if user is trying to apply to their own job
    if (job.postedById === req.user.id) {
      return res.status(400).json({ error: 'Cannot apply to your own job' });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_alumniId: {
          jobId: id,
          alumniId: req.user.id
        }
      }
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        alumniId: req.user.id,
        coverLetter: coverLetter || null
      },
      include: {
        alumni: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            graduationYear: true,
            department: true,
            currentJob: true,
            currentCompany: true,
            skills: true
          }
        }
      }
    });

    res.status(201).json({
      message: `Application submitted for ${job.title}`,
      application
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});

// Get job applications (for job poster)
router.get('/:id/applications', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Check if user owns the job
    const job = await prisma.job.findUnique({
      where: { id },
      select: { postedById: true, title: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.postedById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view applications' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { jobId: id };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          alumni: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
              graduationYear: true,
              department: true,
              currentJob: true,
              currentCompany: true,
              skills: true,
              linkedinUrl: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobApplication.count({ where })
    ]);

    res.json({
      applications,
      job: { title: job.title },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status
router.put('/:jobId/applications/:applicationId', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user owns the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true }
    });

    if (!job || job.postedById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        alumni: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            title: true
          }
        }
      }
    });

    res.json({
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Application update error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Get user's job applications
router.get('/my/applications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { alumniId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              jobType: true,
              experienceLevel: true,
              isActive: true,
              postedBy: {
                select: {
                  name: true,
                  currentCompany: true
                }
              }
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobApplication.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('My applications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get user's posted jobs
router.get('/my/posted', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { postedById: req.user.id },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where: { postedById: req.user.id } })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Posted jobs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch posted jobs' });
  }
});

module.exports = router;
