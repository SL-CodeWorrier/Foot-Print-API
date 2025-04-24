const express = require('express');
const multer = require('multer');
const router = new express.Router();
const Tweet = require('../models/tweet');
const auth = require('../middleware/auth');

// Multer setup for image upload (optional)
const upload = multer({ 
  limits: {
    fileSize: 5 * 5 * 1024 * 1024
  }
});

// POST /tweets - Create a new tweet
router.post('/tweets', auth, upload.single('image'), async (req, res) => {
  try {
    const tweet = new Tweet({
      text: req.body.text,
      user: req.user.name,
      username: req.user.username,
      userId: req.user._id,
      image: req.file ? req.file.buffer : undefined
    });

    await tweet.save();
    res.status(201).send({ message: 'Tweet posted successfully', tweet });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// POST /uploadTweetImage/:id - Upload or update tweet image
router.post('/uploadTweetImage/:id', auth, upload.single('image'), async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.id);
  
      if (!tweet) {
        return res.status(404).send({ error: 'Tweet not found' });
      }
  
      const buffer = await sharp(req.file.buffer).resize({ width: 600 }).png().toBuffer();
      tweet.image = buffer;
      await tweet.save();
  
      res.status(200).send({ message: 'Tweet image uploaded successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  });

// GET /tweets - Fetch all tweets
router.get('/tweets', auth, async (req, res) => {
    try {
      const tweets = await Tweet.find({}).sort({ createdAt: -1 });
  
      if (tweets.length === 0) {
        return res.status(404).send({ message: 'No tweets found!' });
      }
  
      res.status(200).send(tweets);
    } catch (error) {
      res.status(500).send({ error: 'Failed to fetch tweets' });
    }
  });

  // GET /tweet/:id - Fetch a single tweet by ID
router.get('/tweet/:id', async (req, res) => {
    try {
      const tweetId = req.params.id;
  
      const tweet = await Tweet.findById(tweetId);
  
      if (!tweet) {
        return res.status(404).send({ error: 'Tweet not found' });
      }
  
      res.status(200).send(tweet);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // GET /tweets/me - Fetch all tweets by the authenticated user
router.get('/tweets/me', auth, async (req, res) => {
    try {
      const userId = req.user._id; // The authenticated user's ID is stored in req.user._id
  
      // Find tweets by the user's ID
      const tweets = await Tweet.find({ userId });
  
      if (tweets.length === 0) {
        return res.status(404).send({ error: 'No tweets found for this user' });
      }
  
      res.status(200).send(tweets);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // GET /tweets/user/:id - Fetch tweets by another user (specified by their user ID)
router.get('/tweets/user/:id', async (req, res) => {
    try {
      const userId = req.params.id; // Get the userId from the route parameters
  
      // Find tweets by the given userId
      const tweets = await Tweet.find({ userId });
  
      if (tweets.length === 0) {
        return res.status(404).send({ error: 'No tweets found for this user' });
      }
  
      res.status(200).send(tweets); // Send the user's tweets as the response
    } catch (error) {
      res.status(500).send({ error: error.message }); // Handle server errors
    }
  });

  // GET /tweet/:id/image - Serve tweet image
router.get('/tweet/:id/image', auth, async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.id);
  
      if (!tweet || !tweet.image) {
        throw new Error('Tweet image not found');
      }
  
      res.set('Content-Type', 'image/png'); // Always returns as PNG since we resized to PNG
      res.send(tweet.image);
    } catch (error) {
      res.status(404).send({ error: error.message });
    }
  });

  // POST /tweet/:id/like - Like a tweet
router.post('/tweet/:id/like', auth, async (req, res) => {
    try {
      const tweet = await Tweet.findById(req.params.id);
  
      if (!tweet) {
        return res.status(404).send({ error: 'Tweet not found' });
      }
  
      const userId = req.user._id.toString();
  
      // Prevent the same user from liking multiple times
      if (tweet.likes.includes(userId)) {
        return res.status(400).send({ message: 'You have already liked this tweet' });
      }
  
      tweet.likes.push(userId);
      await tweet.save();
  
      res.status(200).send({ message: 'Tweet liked', totalLikes: tweet.likes.length });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // PUT /tweet/:id/unlike - Unlike a tweet
router.put('/tweet/:id/unlike', auth, async (req, res) => {
    try {
      const tweetId = req.params.id;
      const userId = req.user._id.toString();
  
      const tweet = await Tweet.findById(tweetId);
  
      if (!tweet) {
        return res.status(404).send({ error: 'Tweet not found' });
      }
  
      // Check if user already liked the tweet
      const likeIndex = tweet.likes.indexOf(userId);
  
      if (likeIndex === -1) {
        return res.status(400).send({ message: 'You have not liked this tweet yet' });
      }
  
      // Remove userId from likes
      tweet.likes.splice(likeIndex, 1);
  
      await tweet.save();
  
      res.status(200).send({ message: 'Tweet unliked successfully', tweet });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

module.exports = router;