const { z, ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Use issues if errors is undefined, though they should be same
      const issues = error.errors || error.issues || [];
      return res.status(400).json({
        error: 'Validation Error',
        details: issues.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validate;
