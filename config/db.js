const mongoose = require("mongoose");

const connectDB = async () => {
  // ========Validate Database Config========
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }

  // ========Open Mongo Connection========
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully.");
};

module.exports = connectDB;
