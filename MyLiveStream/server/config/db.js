const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI);
    console.log('✅ DB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
