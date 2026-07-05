const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contribution = require('../models/Contribution');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/events/:eventId/contributions
router.get('/:eventId/contributions', async (req, res) => {
  try {
    const contributions = await Contribution.find({ eventId: req.params.eventId }).sort({ timestamp: -1 });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events/:eventId/contributions
router.post('/:eventId/contributions', [
  body('friendName').notEmpty().withMessage('Friend name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const contrib = await Contribution.create({ ...req.body, eventId: req.params.eventId });
    res.status(201).json(contrib);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/events/:eventId/contributions/:id
router.put('/:eventId/contributions/:id', async (req, res) => {
  try {
    const contrib = await Contribution.findOneAndUpdate(
      { _id: req.params.id, eventId: req.params.eventId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contrib) return res.status(404).json({ error: 'Contribution not found' });
    res.json(contrib);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/events/:eventId/contributions/:id
router.delete('/:eventId/contributions/:id', async (req, res) => {
  try {
    const contrib = await Contribution.findOneAndDelete({ _id: req.params.id, eventId: req.params.eventId });
    if (!contrib) return res.status(404).json({ error: 'Contribution not found' });
    res.json({ message: 'Contribution deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
