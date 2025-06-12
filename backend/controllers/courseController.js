const Course = require('../models/Course');
const User = require('../models/User');
const winston = require('winston');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'username profile')
      .populate('lessons');
      
    res.json(courses);
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username profile')
      .populate({
        path: 'lessons',
        match: { isPublished: true }
      });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    winston.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price } = req.body;
    
    const course = new Course({
      title,
      description,
      category,
      price,
      instructor: req.user.id
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};

// Other course-related controller methods...