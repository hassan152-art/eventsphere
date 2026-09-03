require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/app');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('[MongoDB] Connected');
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    throw err;
  }
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
    return;
  }
  return app(req, res);
};