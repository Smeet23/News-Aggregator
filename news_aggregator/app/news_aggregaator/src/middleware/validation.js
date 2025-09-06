const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Post validation rules
const validateCreatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters')
    .escape(),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters')
    .escape(),
  
  body('link')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL'),
  
  handleValidationErrors
];

// Comment validation rules
const validateCreateComment = [
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
    .escape(),
  
  param('_id')
    .isMongoId().withMessage('Invalid post ID'),
  
  handleValidationErrors
];

// Search validation rules
const validateSearch = [
  param('keyword')
    .trim()
    .notEmpty().withMessage('Search keyword is required')
    .isLength({ min: 1, max: 100 }).withMessage('Search keyword must be between 1 and 100 characters')
    .escape(),
  
  handleValidationErrors
];

const validateSearchUsername = [
  param('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 1, max: 50 }).withMessage('Username must be between 1 and 50 characters')
    .escape(),
  
  handleValidationErrors
];

// Vote validation rules
const validateVote = [
  param('_id')
    .isMongoId().withMessage('Invalid ID'),
  
  body('vote')
    .optional()
    .isIn([-1, 0, 1]).withMessage('Vote must be -1, 0, or 1'),
  
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters')
    .escape(),
  
  body('linkedin')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/).withMessage('Please provide a valid LinkedIn URL'),
  
  body('twitter')
    .optional()
    .trim()
    .matches(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.*$/).withMessage('Please provide a valid Twitter/X URL'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCreatePost,
  validateCreateComment,
  validateSearch,
  validateSearchUsername,
  validateVote,
  validateProfileUpdate,
  handleValidationErrors
};