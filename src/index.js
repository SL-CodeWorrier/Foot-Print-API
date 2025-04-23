const express = require('express');
const connectDB = require('./db/mongoose'); // 👈 Import your DB connection function

const userRouter = require('./routers/user');
const tweetRouter = require('./routers/tweet');
const notificationRouter = require('./routers/notification');

const app = express();
app.use(express.json());

app.use(userRouter);
app.use(tweetRouter);
app.use(notificationRouter);

app.get('/', (req, res) => {
  res.send('Hello from Foot-Print Backend API!');
});

// Connect to MongoDB first, then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});