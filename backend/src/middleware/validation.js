const { validationResult } = require('express-validator');

/**
 * Handle validation errors from express-validator
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Check if user owns the resource
 */
exports.checkOwnership = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[idParam]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is owner or admin
      const isOwner = resource.user?.toString() === req.user.id ||
                     resource.customer?.toString() === req.user.id ||
                     resource.author?.toString() === req.user.id;

      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};
