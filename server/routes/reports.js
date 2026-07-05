const express = require('express');
const router = express.Router();
const WeddingEvent = require('../models/WeddingEvent');
const Contribution = require('../models/Contribution');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const { generateReport } = require('../utils/pdfGenerator');

router.use(authMiddleware);

// GET /api/events/:eventId/report — JSON report data
router.get('/:eventId/report', async (req, res) => {
  try {
    const event = await WeddingEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const [contributions, expenses] = await Promise.all([
      Contribution.find({ eventId: event._id }).sort({ timestamp: 1 }),
      Expense.find({ eventId: event._id }).sort({ datetime: 1 }),
    ]);

    const totalCollected = contributions.reduce((s, c) => s + c.amount, 0);
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    res.json({
      event,
      contributions,
      expenses,
      summary: {
        totalCollected,
        totalSpent,
        balance: totalCollected - totalSpent,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/:eventId/report/pdf?lang=ar|fr|en
router.get('/:eventId/report/pdf', async (req, res) => {
  const rawLang = (req.query.lang || 'en').toLowerCase().split('-')[0];
  const lang = ['ar', 'fr', 'en'].includes(rawLang) ? rawLang : 'en';
  try {
    const event = await WeddingEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const [contributions, expenses] = await Promise.all([
      Contribution.find({ eventId: event._id }).sort({ timestamp: 1 }),
      Expense.find({ eventId: event._id }).sort({ datetime: 1 }),
    ]);

    await generateReport(res, event, contributions, expenses, lang);
  } catch (err) {
    console.error('PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'PDF generation failed' });
    }
  }
});

module.exports = router;
