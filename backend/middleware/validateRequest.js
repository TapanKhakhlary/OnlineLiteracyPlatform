const Joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors,
        requestId: req.id
      });
    }
    next();
  };
};