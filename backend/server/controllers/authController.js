const jwt = require('jsonwebtoken');
const User = require('../models/User');
const winston = require('winston');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      role: role || 'student'
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      // Exclude password before sending
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
      });

    });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    winston.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};



// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    });
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};


// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    winston.error(err.message);
    res.status(500).send('Server error');
  }
};

// Social login callback
exports.socialLoginCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      { user: { id: req.user.id, role: req.user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/social-auth?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=social_login_failed`);
  }
};