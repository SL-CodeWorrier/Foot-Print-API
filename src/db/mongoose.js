const mongoose = require('mongoose');

//const uri = "mongodb+srv://chathuathnayaka:Jq5IRuUuw81YQUDn@cluster0.ufru5zk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = "mongodb+srv://chathuathnayaka:Jq5IRuUuw81YQUDn@cluster0.ufru5zk.mongodb.net/footprintdb?retryWrites=true&w=majority&appName=Cluster0";

/*
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("✅ Successfully connected to MongoDB (Mongoose)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit app on DB failure
  }
};
*/
const connectDB = async () => {
  try {
    await mongoose.connect(uri); // simplified - modern Mongoose doesn't need extra options
    console.log("✅ Successfully connected to MongoDB (Mongoose)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
module.exports = connectDB;