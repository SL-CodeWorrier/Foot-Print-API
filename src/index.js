const express = require('express');
const app = express();

const userRouter = require('./routers/user');
const tweetRouter = require('./routers/tweet');
const notificationRouter = require('./routers/notification');

// Middleware to parse JSON
app.use(express.json());

app.use(userRouter);
app.use(tweetRouter);
app.use(notificationRouter);

// Define a test route
app.get('/', (req, res) => {
  res.send('Hello from Twitter Backend API!');
});

// Set port from environment variable or use 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});