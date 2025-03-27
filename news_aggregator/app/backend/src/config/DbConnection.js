require('dotenv').config(); // Load .env file

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI; // Read from environment variable

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
