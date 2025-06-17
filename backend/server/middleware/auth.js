const jwt = require('jsonwebtoken');
const winston = require('winston');

// Authentication middleware
const protect = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    winston.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Export both functions correctly
module.exports = {
  protect,
  authorize,
};
