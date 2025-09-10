const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get donation statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalDonations,
      totalAmount,
      monthlyDonations,
      recentDonations
    ] = await Promise.all([
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.donation.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.donation.findMany({
        where: { status: 'COMPLETED' },
        include: {
          alumni: {
            select: {
              name: true,
              graduationYear: true,
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyDonations,
      recentDonations
    });
  } catch (error) {
    console.error('Donation stats error:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Create Stripe payment intent
router.post('/stripe/create-payment-intent', authenticateToken, requireVerification, validate(schemas.donation), async (req, res) => {
  try {
    const { amount, currency = 'USD', purpose } = req.validatedData;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        alumniId: req.user.id,
        purpose: purpose || 'General Donation'
      }
    });

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        alumniId: req.user.id,
        amount,
        currency,
        purpose,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
        status: 'PENDING'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create Razorpay order
router.post('/razorpay/create-order', authenticateToken, requireVerification, validate(schemas.donation), async (req, res) => {
  try {
    const { amount, currency = 'INR', purpose } = req.validatedData;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `donation_${Date.now()}`,
      notes: {
        alumniId: req.user.id,
        purpose: purpose || 'General Donation'
      }
    });

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        alumniId: req.user.id,
        amount,
        currency,
        purpose,
        paymentMethod: 'RAZORPAY',
        transactionId: order.id,
        status: 'PENDING'
      }
    });

    res.json({
      orderId: order.id,
      donationId: donation.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update donation status
      const donation = await prisma.donation.update({
        where: { transactionId: paymentIntentId },
        data: { 
          status: 'COMPLETED',
          receipt: `receipt_${Date.now()}.pdf` // Generate receipt
        },
        include: {
          alumni: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      res.json({
        message: 'Payment confirmed successfully',
        donation
      });
    } else {
      res.status(400).json({ 
        error: 'Payment not completed',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update donation status
    const donation = await prisma.donation.update({
      where: { transactionId: razorpay_order_id },
      data: { 
        status: 'COMPLETED',
        receipt: `receipt_${Date.now()}.pdf` // Generate receipt
      },
      include: {
        alumni: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Payment verified successfully',
      donation
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get user's donations
router.get('/my/donations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { alumniId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        select: {
          id: true,
          amount: true,
          currency: true,
          purpose: true,
          paymentMethod: true,
          status: true,
          receipt: true,
          createdAt: true
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.donation.count({ where })
    ]);

    // Calculate total donated
    const totalDonated = await prisma.donation.aggregate({
      where: {
        alumniId: req.user.id,
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    res.json({
      donations,
      totalDonated: totalDonated._sum.amount || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('User donations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get donation receipt
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id },
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

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.alumniId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this receipt' });
    }

    if (donation.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Receipt not available for incomplete donations' });
    }

    // Generate receipt data
    const receiptData = {
      donationId: donation.id,
      transactionId: donation.transactionId,
      donor: {
        name: donation.alumni.name,
        email: donation.alumni.email,
        graduationYear: donation.alumni.graduationYear,
        department: donation.alumni.department
      },
      amount: donation.amount,
      currency: donation.currency,
      purpose: donation.purpose,
      paymentMethod: donation.paymentMethod,
      donationDate: donation.createdAt,
      receiptNumber: `GEC-${donation.createdAt.getFullYear()}-${donation.id.slice(-8).toUpperCase()}`
    };

    res.json({
      message: 'Receipt generated successfully',
      receipt: receiptData
    });
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Get all donations (Admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, paymentMethod } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
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
      prisma.donation.count({ where })
    ]);

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin donations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

module.exports = router;
