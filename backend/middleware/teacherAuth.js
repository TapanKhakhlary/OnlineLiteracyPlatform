const admin = require('firebase-admin');

const verifyTeacher = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const teacher = await Teacher.findOne({ userId: decodedToken.uid });
    if (!teacher) return res.status(403).json({ message: 'Not authorized' });
    
    req.teacher = teacher;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyTeacher;