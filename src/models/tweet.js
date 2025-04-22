const mongoose = require('mongoose');
const { ref } = require('process');

const tweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: Buffer, // For storing binary image data
    required: false // Optional field
  },
  likes: {
    type: [String], // Array of user IDs or usernames who liked
    required: false,
    default: [] // Default to an empty array
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

tweetSchema.methods.toJSON = function () {
  const tweet = this;
  const tweetObject = tweet.toObject();

  if(tweetObject.image){
    tweetObject.image = 'true'
  }

  return tweetObject;
};

module.exports = mongoose.model('Tweet', tweetSchema);