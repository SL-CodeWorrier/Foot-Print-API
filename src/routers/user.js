const express = require('express');
const multer = require('multer');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

const upload = multer({
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB max file size
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload a JPG, JPEG, or PNG file'));
      }
      cb(undefined, true);
    },
  });

// POST /user - create a new user
router.post('/user', async (req, res) => {
  const user = new User(req.body);
    try {
      await user.save();
      res.status(201).send({ message: 'User created successfully', user });
    } catch (error) {
      res.status(400).send({ message: error.message, user });
    }
  });

  // GET /users - fetch all users
router.get('/users', async (req, res) => {
    try {
      const users = await User.find({});
  
      if (users.length === 0) {
        return res.status(404).send({ message: 'No any single user found!' });
      }
  
      res.status(200).send(users);
    } catch (error) {
      res.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  router.post('/users/login', async (req, res) => {
    try {
      console.log("📥 Incoming login body:", req.body);
  
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).send({ error: "Email or password missing!" });
      }
  
      const user = await User.findByCredentials(email, password);
      const token = await user.generateAuthToken();
  
      res.status(200).send({ message: 'Login successful', user, token });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(400).send({ error: error.message || 'Unable to login!' });
    }
  });

// GET /user/:id - fetch a single user by ID
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
      // Attempt to find the user by ID in the database
      const user = await User.findOne({ _id: userId });

      // If the user does not exist, return a 404
      if (!user) {
          return res.status(404).send({ error: 'User not found' });
      }

      // If the user is found, send the user data with a 200 status
      res.status(200).send(user);
  } catch (error) {
      // Log the error on the server for debugging
      console.error('Error fetching user:', error);

      // Send a 500 status if there's an internal server error
      res.status(500).send({
          error: 'Failed to fetch user',
          details: error.message || 'Unknown error'
      });
  }
});

  // POST /user/:id/avatar - Upload profile picture
router.post('/user/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  
      user.avatar = buffer;
      user.avatarExists = true;
      await user.save();
  
      res.send({ message: 'Avatar uploaded successfully' });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  });

  // GET /user/:id/avatar - Serve avatar
router.get('/user/:id/avatar', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user || !user.avatar) {
        throw new Error('Avatar not found');
      }
  
      res.set('Content-Type', 'image/png');
      res.send(user.avatar);
    } catch (error) {
      res.status(404).send({ error: error.message });
    }
  });

  // PUT /user/:id/follow - Follow a user
router.put('/user/:id/follow', auth, async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const currentUserId = req.user._id.toString();
  
      if (targetUserId === currentUserId) {
        return res.status(400).send({ error: "You can't follow yourself!" });
      }
  
      const targetUser = await User.findById(targetUserId);
      const currentUser = req.user;
  
      if (!targetUser) {
        return res.status(404).send({ error: 'User to follow not found' });
      }
  
      // Prevent duplicates
      if (!currentUser.following.includes(targetUserId)) {
        currentUser.following.push(targetUserId);
      }
  
      if (!targetUser.followers.includes(currentUserId)) {
        targetUser.followers.push(currentUserId);
      }
  
      await currentUser.save();
      await targetUser.save();
  
      res.status(200).send({ message: `You are now following ${targetUser.username}` });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // PUT /user/:id/unfollow - Unfollow a user
router.put('/user/:id/unfollow', auth, async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const currentUserId = req.user._id.toString();
  
      if (targetUserId === currentUserId) {
        return res.status(400).send({ error: "You can't unfollow yourself!" });
      }
  
      const targetUser = await User.findById(targetUserId);
      const currentUser = req.user;
  
      if (!targetUser) {
        return res.status(404).send({ error: 'User to unfollow not found' });
      }
  
      // Remove following
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
  
      // Remove follower
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );
  
      await currentUser.save();
      await targetUser.save();
  
      res.status(200).send({ message: `You have unfollowed ${targetUser.username}` });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

 // PATCH /user/me - Update current authenticated user's attributes (excluding username)
router.patch('/user/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'bio', 'website', 'location', 'avatarExists'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates! Username cannot be updated.' });
    }
  
    try {
      const user = await User.findOne({ username: req.user.username });
  
      if (!user) {
        return res.status(404).send({ error: 'Authenticated user not found' });
      }
  
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
  
      await user.save();
  
      res.send({ message: 'User updated successfully', user });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

  // DELETE /user/:id - delete user by ID
router.delete('/user/:id', auth, async (req, res) => {
    const _id = req.params.id;
  
    try {
      const user = await User.findByIdAndDelete(_id);
  
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      res.status(200).send({ message: 'User deleted successfully', user });
    } catch (error) {
      res.status(500).send({ error: 'Failed to delete user' });
    }
  });
  
  module.exports = router;