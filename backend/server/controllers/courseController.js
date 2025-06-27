const Course = require('../models/Course');
const User = require('../models/User');
const winston = require('winston');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
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

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
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

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    // 🔍 Debug: Log instructor ID from token
    console.log("Instructor ID from token:", req.user.id);
   
    const course = new Course({
      title,
      description,
      category,
      price,
      instructor: req.user.id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('❌ Course creation failed:', err);  // Add this line
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update an existing course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category, price, isPublished } = req.body;

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;
    course.isPublished = typeof isPublished === 'boolean' ? isPublished : course.isPublished;

    await course.save();
    res.json(course);
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this course' });
    }

    await course.remove();
    res.json({ msg: 'Course removed successfully' });
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};
