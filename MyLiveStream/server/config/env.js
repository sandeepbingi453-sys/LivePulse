require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mylivestream'
};
