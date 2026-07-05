const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingEvent', required: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'other', trim: true },
  amount: { type: Number, required: true, min: 0 },
  datetime: { type: Date, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
