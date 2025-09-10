const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Submit feedback
router.post('/', authenticateToken, requireVerification, validate(schemas.feedback), async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        ...req.validatedData,
        alumniId: req.user.id
      },
      include: {
        alumni: {
          select: {
            name: true,
            email: true,
            graduationYear: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get user's feedback
router.get('/my/feedback', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { alumniId: req.user.id };
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        select: {
          id: true,
          category: true,
          subject: true,
          message: true,
          rating: true,
          status: true,
          createdAt: true,
          updatedAt: true
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
    console.error('User feedback fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalFeedback,
      categoryStats,
      statusStats,
      averageRating
    ] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.feedback.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.feedback.aggregate({
        where: { rating: { not: null } },
        _avg: { rating: true }
      })
    ]);

    res.json({
      totalFeedback,
      categoryStats: categoryStats.map(cat => ({
        category: cat.category,
        count: cat._count.category
      })),
      statusStats: statusStats.map(stat => ({
        status: stat.status,
        count: stat._count.status
      })),
      averageRating: averageRating._avg.rating || 0
    });
  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
});

module.exports = router;
