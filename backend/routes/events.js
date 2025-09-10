const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      upcoming = 'true',
      page = 1,
      limit = 20,
      sortBy = 'eventDate',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isActive: true
    };

    if (upcoming === 'true') {
      where.eventDate = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          _count: {
            select: {
              registrations: true
            }
          }
        },
        skip,
        take,
        orderBy
      }),
      prisma.event.count({ where })
    ]);

    // Add registration status for authenticated users
    if (req.user) {
      const eventIds = events.map(event => event.id);
      const userRegistrations = await prisma.eventRegistration.findMany({
        where: {
          alumniId: req.user.id,
          eventId: { in: eventIds }
        },
        select: { eventId: true, status: true }
      });

      const registrationMap = new Map(
        userRegistrations.map(reg => [reg.eventId, reg.status])
      );

      events.forEach(event => {
        event.userRegistrationStatus = registrationMap.get(event.id) || null;
      });
    }

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!event || !event.isActive) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check registration status for authenticated users
    let userRegistrationStatus = null;
    if (req.user) {
      const registration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_alumniId: {
            eventId: id,
            alumniId: req.user.id
          }
        }
      });
      userRegistrationStatus = registration?.status || null;
    }

    res.json({
      event: {
        ...event,
        userRegistrationStatus
      }
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (Admin only - will be implemented in admin routes)
router.post('/', authenticateToken, requireVerification, validate(schemas.event), async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: req.validatedData
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        eventDate: true,
        maxAttendees: true,
        isActive: true,
        _count: {
          select: {
            registrations: {
              where: { status: 'REGISTERED' }
            }
          }
        }
      }
    });

    if (!event || !event.isActive) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }

    // Check if event is in the future
    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({ error: 'Cannot register for past events' });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_alumniId: {
          eventId: id,
          alumniId: req.user.id
        }
      }
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'REGISTERED') {
        return res.status(409).json({ error: 'Already registered for this event' });
      }
      if (existingRegistration.status === 'CANCELLED') {
        // Reactivate registration
        const registration = await prisma.eventRegistration.update({
          where: { id: existingRegistration.id },
          data: { status: 'REGISTERED' }
        });

        return res.json({
          message: `Registration reactivated for ${event.title}`,
          registration
        });
      }
    }

    // Check capacity
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      // Add to waitlist
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: id,
          alumniId: req.user.id,
          status: 'WAITLISTED'
        }
      });

      return res.status(201).json({
        message: `Added to waitlist for ${event.title}`,
        registration
      });
    }

    // Register for event
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: id,
        alumniId: req.user.id,
        status: 'REGISTERED'
      }
    });

    res.status(201).json({
      message: `Successfully registered for ${event.title}`,
      registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Cancel event registration
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_alumniId: {
          eventId: id,
          alumniId: req.user.id
        }
      },
      include: {
        event: {
          select: { title: true, eventDate: true }
        }
      }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Registration already cancelled' });
    }

    // Check if event is in the future
    if (new Date(registration.event.eventDate) < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel registration for past events' });
    }

    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      message: `Registration cancelled for ${registration.event.title}`
    });
  } catch (error) {
    console.error('Registration cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// Get event registrations (for event organizers/admins)
router.get('/:id/registrations', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, status = 'REGISTERED' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: { title: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const where = { eventId: id };
    if (status) {
      where.status = status;
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
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
              phone: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.eventRegistration.count({ where })
    ]);

    res.json({
      registrations,
      event: { title: event.title },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Check-in attendee
router.post('/:eventId/checkin/:registrationId', authenticateToken, requireVerification, async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: { select: { title: true } },
        alumni: { select: { name: true } }
      }
    });

    if (!registration || registration.eventId !== eventId) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'REGISTERED') {
      return res.status(400).json({ error: 'Only registered attendees can be checked in' });
    }

    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { checkedIn: true }
    });

    res.json({
      message: `${registration.alumni.name} checked in successfully`,
      registration: updatedRegistration
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in attendee' });
  }
});

// Get user's event registrations
router.get('/my/registrations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, upcoming = 'false' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { alumniId: req.user.id };
    
    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.event = {
        eventDate: { gte: new Date() }
      };
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              location: true,
              eventDate: true,
              endDate: true,
              image: true,
              ticketPrice: true
            }
          }
        },
        skip,
        take,
        orderBy: { event: { eventDate: 'desc' } }
      }),
      prisma.eventRegistration.count({ where })
    ]);

    res.json({
      registrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('My registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

module.exports = router;
