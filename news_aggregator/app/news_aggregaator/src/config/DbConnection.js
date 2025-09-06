// Environment variables are already loaded in index.js

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI; // Read from environment variable

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
