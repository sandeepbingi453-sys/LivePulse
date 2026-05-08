const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const streamKey = Math.random().toString(36).substring(2, 12);
    await new User({ username, password: hashedPassword, streamKey }).save();
    res.status(201).json({ message: 'Success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id, streamKey: user.streamKey }, JWT_SECRET);
    res.json({ token, streamKey: user.streamKey, username: user.username });
  } else {
    res.status(401).json({ error: 'Failed' });
  }
});

module.exports = router;
