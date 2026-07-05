const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/friends
router.get('/', async (req, res) => {
  try {
    const friends = await Friend.find().sort({ name: 1 });
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/friends
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const friend = await Friend.create({ name: name.trim() });
    res.status(201).json(friend);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Friend already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/friends/:id
router.delete('/:id', async (req, res) => {
  try {
    const friend = await Friend.findByIdAndDelete(req.params.id);
    if (!friend) return res.status(404).json({ error: 'Friend not found' });
    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
