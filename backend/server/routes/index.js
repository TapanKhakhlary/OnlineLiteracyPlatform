const express = require('express');
const router = express.Router();

// Sub-route imports
const authRoutes = require('./auth');

// Mount sub-routes
router.use('/auth', authRoutes); // handles /api/v1/auth/*

module.exports = router;
