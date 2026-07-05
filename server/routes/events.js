const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WeddingEvent = require('../models/WeddingEvent');
const Contribution = require('../models/Contribution');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/events — list all events
router.get('/', async (req, res) => {
  try {
    const events = await WeddingEvent.find().sort({ createdAt: -1 });

    // Attach totals
    const enriched = await Promise.all(events.map(async (ev) => {
      const [contributions, expenses] = await Promise.all([
        Contribution.aggregate([{ $match: { eventId: ev._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Expense.aggregate([{ $match: { eventId: ev._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ]);
      const totalCollected = contributions[0]?.total || 0;
      const totalSpent = expenses[0]?.total || 0;
      return { ...ev.toObject(), totalCollected, totalSpent, balance: totalCollected - totalSpent };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const ev = await WeddingEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    const [contributions, expenses] = await Promise.all([
      Contribution.aggregate([{ $match: { eventId: ev._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { eventId: ev._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const totalCollected = contributions[0]?.total || 0;
    const totalSpent = expenses[0]?.total || 0;

    res.json({ ...ev.toObject(), totalCollected, totalSpent, balance: totalCollected - totalSpent });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events — create event
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('groomName').notEmpty().withMessage('Groom name is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const ev = await WeddingEvent.create(req.body);
    res.status(201).json({ ...ev.toObject(), totalCollected: 0, totalSpent: 0, balance: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/events/:id — update event
router.put('/:id', async (req, res) => {
  try {
    const ev = await WeddingEvent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/events/:id/status — toggle active/closed
router.patch('/:id/status', async (req, res) => {
  try {
    const ev = await WeddingEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    ev.status = ev.status === 'active' ? 'closed' : 'active';
    await ev.save();
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const ev = await WeddingEvent.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    // Cascade delete contributions and expenses
    await Promise.all([
      Contribution.deleteMany({ eventId: req.params.id }),
      Expense.deleteMany({ eventId: req.params.id }),
    ]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
