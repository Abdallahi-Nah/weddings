const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/events/:eventId/expenses
router.get('/:eventId/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find({ eventId: req.params.eventId }).sort({ datetime: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events/:eventId/expenses
router.post('/:eventId/expenses', [
  body('name').notEmpty().withMessage('Expense name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('datetime').isISO8601().withMessage('Valid datetime is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const expense = await Expense.create({ ...req.body, eventId: req.params.eventId });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/events/:eventId/expenses/:id
router.put('/:eventId/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, eventId: req.params.eventId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/events/:eventId/expenses/:id
router.delete('/:eventId/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, eventId: req.params.eventId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
