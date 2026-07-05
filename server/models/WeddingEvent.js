const mongoose = require('mongoose');

const weddingEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  groomName: { type: String, required: true, trim: true },
  eventDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('WeddingEvent', weddingEventSchema);
