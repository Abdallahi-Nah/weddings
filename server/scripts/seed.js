require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const WeddingEvent = require('../models/WeddingEvent');
const Contribution = require('../models/Contribution');
const Expense = require('../models/Expense');
const Friend = require('../models/Friend');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ── Supervisor account ──────────────────────────────
  const phone = process.env.ADMIN_PHONE || '48839340';
  const password = process.env.ADMIN_PASSWORD || 'ADMIN123';
  let user = await User.findOne({ phone });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await User.create({ phone, passwordHash });
    console.log(`✅ Created supervisor: phone=${phone}`);
  } else {
    // Update password in case it changed
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    console.log(`ℹ️  Supervisor already exists (phone=${phone}), password updated.`);
  }

  // ── Friends ─────────────────────────────────────────
  const friendNames = ['أحمد ولد سيد', 'محمد ولد أحمد', 'عبدالله ولد محمد', 'يحيى ولد سيدي', 'إبراهيم ولد عمر', 'موسى ولد إسماعيل'];
  for (const name of friendNames) {
    try { await Friend.create({ name }); } catch {} // skip duplicates
  }
  console.log('✅ Friends seeded');

  // ── Sample Wedding Event 1 (closed) ─────────────────
  let event1 = await WeddingEvent.findOne({ groomName: 'أحمد ولد سيد' });
  if (!event1) {
    event1 = await WeddingEvent.create({
      title: 'زواج أحمد — يونيو 2026',
      groomName: 'أحمد ولد سيد',
      eventDate: new Date('2026-06-15'),
      status: 'closed',
      notes: 'حفل جميل في فندق الصداقة',
    });
    console.log('✅ Event 1 created');

    const friends = friendNames.slice(1); // all except the groom
    const amounts = [5000, 4500, 5000, 4000, 6000];
    for (let i = 0; i < friends.length; i++) {
      await Contribution.create({
        eventId: event1._id,
        friendName: friends[i],
        amount: amounts[i],
        timestamp: new Date('2026-06-10T10:00:00Z'),
      });
    }

    await Expense.create([
      { eventId: event1._id, name: 'استئجار شقة للعريس', category: 'apartment', amount: 8000, datetime: new Date('2026-06-12T09:00:00Z'), notes: 'شقة في انواكشوط لمدة 3 أيام' },
      { eventId: event1._id, name: 'استئجار سيارات', category: 'cars', amount: 5500, datetime: new Date('2026-06-14T08:00:00Z'), notes: 'سيارتان لمدة يومين' },
      { eventId: event1._id, name: 'وليمة الأعراس', category: 'banquet', amount: 7000, datetime: new Date('2026-06-15T12:00:00Z'), notes: 'وجبات للضيوف والعريس والعروس' },
    ]);
    console.log('✅ Event 1 contributions & expenses seeded');
  }

  // ── Sample Wedding Event 2 (active) ─────────────────
  let event2 = await WeddingEvent.findOne({ groomName: 'محمد ولد أحمد' });
  if (!event2) {
    event2 = await WeddingEvent.create({
      title: 'زواج محمد — يوليو 2026',
      groomName: 'محمد ولد أحمد',
      eventDate: new Date('2026-07-20'),
      status: 'active',
    });
    console.log('✅ Event 2 created');

    const friends2 = ['أحمد ولد سيد', 'عبدالله ولد محمد', 'يحيى ولد سيدي', 'إبراهيم ولد عمر'];
    const amounts2 = [5000, 5000, 4500, 5000];
    for (let i = 0; i < friends2.length; i++) {
      await Contribution.create({
        eventId: event2._id,
        friendName: friends2[i],
        amount: amounts2[i],
        timestamp: new Date('2026-07-01T10:00:00Z'),
      });
    }

    await Expense.create([
      { eventId: event2._id, name: 'استئجار شقة', category: 'apartment', amount: 9000, datetime: new Date('2026-07-05T10:00:00Z'), notes: 'شقة فاخرة' },
    ]);
    console.log('✅ Event 2 contributions & expenses seeded');
  }

  console.log('\n🎉 Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
