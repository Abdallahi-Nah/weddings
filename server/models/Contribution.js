const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingEvent', required: true, index: true },
  friendName: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contribution', contributionSchema);
