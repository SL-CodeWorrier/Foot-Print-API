const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: Buffer,
    required: false // optional
  },
  avatarExists: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    maxlength: 160
  },
  website: {
    type: String,
    validate: {
      validator: function (v) {
        return v ? validator.isURL(v) : true;
      },
      message: 'Please enter a valid URL'
    }
  },
  location: {
    type: String,
    maxlength: 100
  },
  followers: {
    type: Array, // user IDs or usernames
    default: []
  },
  following: {
    type: Array, // user IDs or usernames
    default: []
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.virtual('tweets', {
  ref: 'Tweet',
  localField: '_id',
  foreignField: 'user'
});

userSchema.virtual('notificationSent', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'notSenderId'
});

userSchema.virtual('notificationReceived', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'notReceiverId'
});

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error('Unable to login!');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login!');
  }

  return user;
};

// Inside userSchema.methods
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    'twittercourse', // Use a secure secret key
    { expiresIn: '7d' } // Token expires in 7 days
  );

  user.tokens = user.tokens.concat({ token });
  await user.save(); // Save the token to the database

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // Remove sensitive or large fields
  delete userObject.password;

  return userObject;
};

module.exports = mongoose.model('User', userSchema);