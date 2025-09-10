const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get alumni directory with filters and search
router.get('/directory', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      department,
      graduationYear,
      location,
      company,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isPublic: true,
      isVerified: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { currentJob: { contains: search, mode: 'insensitive' } },
        { currentCompany: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } }
      ];
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }

    if (graduationYear) {
      where.graduationYear = parseInt(graduationYear);
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (company) {
      where.currentCompany = { contains: company, mode: 'insensitive' };
    }

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        select: {
          id: true,
          name: true,
          profilePicture: true,
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
        orderBy
      }),
      prisma.alumni.count({ where })
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
    console.error('Directory fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alumni directory' });
  }
});

// Get single alumni profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const alumni = await prisma.alumni.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profilePicture: true,
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
        isPublic: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            postedJobs: true,
            successStories: true
          }
        }
      }
    });

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Check if profile is public or if user is viewing their own profile
    if (!alumni.isPublic && (!req.user || req.user.id !== id)) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    // Check if alumni is verified
    if (!alumni.isVerified) {
      return res.status(404).json({ error: 'Alumni profile not verified' });
    }

    // Check if current user is following this alumni
    let isFollowing = false;
    if (req.user && req.user.id !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id
          }
        }
      });
      isFollowing = !!follow;
    }

    res.json({
      alumni: {
        ...alumni,
        isFollowing
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alumni profile' });
  }
});

// Follow/Unfollow alumni
router.post('/:id/follow', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (followerId === id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target alumni exists and is verified
    const targetAlumni = await prisma.alumni.findUnique({
      where: { id },
      select: { id: true, isVerified: true, name: true }
    });

    if (!targetAlumni || !targetAlumni.isVerified) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: id
          }
        }
      });

      res.json({ 
        message: `Unfollowed ${targetAlumni.name}`,
        isFollowing: false 
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId: id
        }
      });

      res.json({ 
        message: `Now following ${targetAlumni.name}`,
        isFollowing: true 
      });
    }
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({ error: 'Failed to update follow status' });
  }
});

// Get alumni followers
router.get('/:id/followers', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
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
      prisma.follow.count({ where: { followingId: id } })
    ]);

    res.json({
      followers: followers.map(f => f.follower),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Followers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get alumni following
router.get('/:id/following', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
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
      prisma.follow.count({ where: { followerId: id } })
    ]);

    res.json({
      following: following.map(f => f.following),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Following fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Get alumni statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalAlumni,
      verifiedAlumni,
      totalDepartments,
      recentAlumni
    ] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.count({ where: { isVerified: true } }),
      prisma.alumni.groupBy({
        by: ['department'],
        _count: { department: true }
      }),
      prisma.alumni.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    const departmentStats = totalDepartments.map(dept => ({
      department: dept.department,
      count: dept._count.department
    }));

    res.json({
      totalAlumni,
      verifiedAlumni,
      pendingVerification: totalAlumni - verifiedAlumni,
      totalDepartments: totalDepartments.length,
      recentAlumni,
      departmentStats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
