const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { db } = require('../config/firebaseConfig');

// Get teacher profile
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.params.id });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update availability
router.patch('/availability/:id', async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { userId: req.params.id },
      { $set: { availability: req.body } },
      { new: true }
    );
    res.json(updatedTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;