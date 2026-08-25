const { body } = require('express-validator');

const createEventValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('registrationDeadline').isISO8601().withMessage('A valid registration deadline is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be a positive number'),
];

module.exports = { createEventValidator };
