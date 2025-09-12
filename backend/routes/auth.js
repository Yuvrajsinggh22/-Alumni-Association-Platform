const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validate, schemas } = require('../utils/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new alumni (auto-verified)
router.post('/register', validate(schemas.alumniRegistration), async (req, res) => {
  try {
    const { email, password, firstName, lastName, skills, interests, ...profileData } = req.validatedData;

    // Check if alumni already exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { email }
    });

    if (existingAlumni) {
      return res.status(409).json({ error: 'Alumni already registered with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Convert skills and interests arrays to comma-separated strings
    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '');
    const interestsStr = Array.isArray(interests) ? interests.join(',') : (interests || '');

    // Create alumni with auto verification
    const alumni = await prisma.alumni.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        ...profileData,
        skills: skillsStr,
        interests: interestsStr,
        isVerified: true,      // 👈 auto-verified
        emailVerified: true    // 👈 auto-email verified
      },
      select: {
        id: true,
        email: true,
        name: true,
        graduationYear: true,
        degree: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({ 
      id: alumni.id, 
      email: alumni.email,
      type: 'alumni'
    });

    res.status(201).json({
      message: 'Alumni registered successfully',
      alumni,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login alumni
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find alumni
    const alumni = await prisma.alumni.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        graduationYear: true,
        degree: true,
        isVerified: true,
        emailVerified: true,
        profilePicture: true,
        lastLogin: true
      }
    });

    if (!alumni) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, alumni.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.alumni.update({
      where: { id: alumni.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = generateToken({ 
      id: alumni.id, 
      email: alumni.email,
      type: 'alumni'
    });

    // Remove password from response
    const { password: _, ...alumniData } = alumni;

    res.json({
      message: 'Login successful',
      alumni: alumniData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
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
        isVerified: true,
        emailVerified: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.json(alumni);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
  