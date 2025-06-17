const express = require('express');
const router = express.Router();

// Import controller methods
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all published courses (Public)
router.get('/', getCourses);

// @route   GET /api/courses/:id
// @desc    Get single course by ID (Public)
router.get('/:id', getCourse);

// @route   POST /api/courses
// @desc    Create new course (Private: teacher/admin only)
router.post('/', protect, authorize('teacher', 'admin'), createCourse);

// @route   PUT /api/courses/:id
// @desc    Update a course by ID (Private: teacher/admin only)
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete a course by ID (Private: teacher/admin only)
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

module.exports = router;
