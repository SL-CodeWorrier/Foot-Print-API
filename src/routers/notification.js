const express = require('express');
const multer = require('multer');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const notification = require('../models/notification');

// POST /notification - Create a new notification
router.post('/notification', auth, async (req, res) => {
    try {
      const { notReceiverId, notificationType, postText } = req.body;
  
      if (!notReceiverId || !notificationType) {
        return res.status(400).send({ error: 'Receiver ID and notification type are required.' });
      }
  
      const notification = new Notification({
        username: req.user.username,
        notSenderId: req.user._id,
        notReceiverId,
        notificationType,
        postText
      });
  
      await notification.save();
      res.status(201).send({ message: 'Notification created successfully', notification });
  
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // GET /notifications - Fetch all notifications for the logged-in user
router.get('/notifications', auth, async (req, res) => {
    try {
      const userId = req.user._id;
  
      const notifications = await Notification.find({ notReceiverId: userId })
        .sort({ createdAt: -1 }) // Optional: newest first
        .populate('notSenderId', 'username') // Optional: include sender username
        .populate('notReceiverId', 'username'); // Optional: include receiver username
  
      res.status(200).send(notifications);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // GET /notification/:id - Get all notifications received by a specific user
router.get('/notification/:id', async (req, res) => {
    try {
      const notReceiverId = req.params.id;
  
      const notifications = await Notification.find({ notReceiverId })
        .populate('notSenderId', 'username')    // Include sender's username
        .populate('notReceiverId', 'username')  // Include receiver's username
        .sort({ createdAt: -1 }); // Optional: latest first
  
      if (notifications.length === 0) {
        return res.status(404).send({ message: 'No notifications found for this user.' });
      }
  
      res.status(200).send({ notifications });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  module.exports = router; 
  
  