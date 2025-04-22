const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  notSenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notReceiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationType: {
    type: String,
    required: false
  },
  postText: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Notification', notificationSchema);