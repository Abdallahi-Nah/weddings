const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
