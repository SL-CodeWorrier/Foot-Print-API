const mongoose = require('mongoose');

const uri = "mongodb+srv://chathuathnayaka:Jq5IRuUuw81YQUDn@cluster0.ufru5zk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
  console.log("✅ Successfully connected to MongoDB (Mongoose)");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});