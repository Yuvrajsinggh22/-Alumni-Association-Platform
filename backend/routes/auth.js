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

// Register new alumni
router.post('/register', validate(schemas.alumniRegistration), async (req, res) => {
  try {
    const { email, password, ...profileData } = req.validatedData;

    // Check if alumni already exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { email }
    });

    if (existingAlumni) {
      return res.status(409).json({ error: 'Alumni already registered with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create alumni
    const alumni = await prisma.alumni.create({
      data: {
        email,
        password: hashedPassword,
        ...profileData
      },
      select: {
        id: true,
        email: true,
        name: true,
        graduationYear: true,
        department: true,
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
      token,
      note: 'Account pending admin verification'
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
        department: true,
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
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.json({ alumni });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticateToken, validate(schemas.alumniUpdate), async (req, res) => {
  try {
    const updatedAlumni = await prisma.alumni.update({
      where: { id: req.user.id },
      data: req.validatedData,
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
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      alumni: updatedAlumni
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters and contain uppercase, lowercase, number, and special character' 
      });
    }

    // Get current password hash
    const alumni = await prisma.alumni.findUnique({
      where: { id: req.user.id },
      select: { password: true }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, alumni.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.alumni.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken({ 
      id: req.user.id, 
      email: req.user.email,
      type: 'alumni'
    });

    res.json({ 
      message: 'Token refreshed successfully',
      token: newToken 
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
