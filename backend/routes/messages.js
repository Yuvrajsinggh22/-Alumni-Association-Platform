const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireVerification } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Send message
router.post('/', authenticateToken, requireVerification, validate(schemas.message), async (req, res) => {
  try {
    const { receiverId, content } = req.validatedData;

    // Check if receiver exists and is verified
    const receiver = await prisma.alumni.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, isVerified: true }
    });

    if (!receiver || !receiver.isVerified) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get unique conversations with latest message
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (conversation_id) 
        conversation_id,
        other_user_id,
        other_user_name,
        other_user_picture,
        latest_message,
        latest_message_time,
        is_read,
        unread_count
      FROM (
        SELECT 
          CASE 
            WHEN sender_id = ${req.user.id} THEN receiver_id
            ELSE sender_id
          END as conversation_id,
          CASE 
            WHEN sender_id = ${req.user.id} THEN receiver_id
            ELSE sender_id
          END as other_user_id,
          CASE 
            WHEN sender_id = ${req.user.id} THEN r.name
            ELSE s.name
          END as other_user_name,
          CASE 
            WHEN sender_id = ${req.user.id} THEN r.profile_picture
            ELSE s.profile_picture
          END as other_user_picture,
          content as latest_message,
          created_at as latest_message_time,
          CASE 
            WHEN sender_id = ${req.user.id} THEN true
            ELSE is_read
          END as is_read,
          (
            SELECT COUNT(*)
            FROM messages m2
            WHERE m2.receiver_id = ${req.user.id}
            AND m2.sender_id = CASE 
              WHEN m.sender_id = ${req.user.id} THEN m.receiver_id
              ELSE m.sender_id
            END
            AND m2.is_read = false
          ) as unread_count
        FROM messages m
        JOIN alumni s ON m.sender_id = s.id
        JOIN alumni r ON m.receiver_id = r.id
        WHERE sender_id = ${req.user.id} OR receiver_id = ${req.user.id}
        ORDER BY created_at DESC
      ) conversations
      ORDER BY conversation_id, latest_message_time DESC
      LIMIT ${take} OFFSET ${skip}
    `;

    res.json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages with specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Check if other user exists
    const otherUser = await prisma.alumni.findUnique({
      where: { id: userId },
      select: { id: true, name: true, profilePicture: true, isVerified: true }
    });

    if (!otherUser || !otherUser.isVerified) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id }
          ]
        }
      })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      messages: messages.reverse(), // Show oldest first
      otherUser,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      select: { receiverId: true }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to mark this message as read' });
    }

    await prisma.message.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
