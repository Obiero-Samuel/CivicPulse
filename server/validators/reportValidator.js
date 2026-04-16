const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const validateReport = [
  body('title')
    .trim()
    .notEmpty().withMessage('Report title is required.')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5–200 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters.'),
  body('category_id')
    .notEmpty().withMessage('Category is required.')
    .isInt({ min: 1 }).withMessage('Invalid category.'),
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude.'),
  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude.'),
  handleValidationErrors,
];

const validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['open', 'in_progress', 'resolved', 'rejected', 'escalated'])
    .withMessage('Invalid status value.'),
  body('note')
    .optional()
    .isLength({ max: 500 }).withMessage('Note must be under 500 characters.'),
  handleValidationErrors,
];

module.exports = { validateReport, validateStatusUpdate };
