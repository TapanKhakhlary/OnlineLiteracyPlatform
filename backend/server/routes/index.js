const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const courseRoutes = require('./courseRoutes');

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

module.exports = router;
