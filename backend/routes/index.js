const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');

router.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy ✅' });
});

router.use('/auth', authRoutes); // <- this line is important!

module.exports = router;
