const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['organizer', 'customer'] },
  photo: String,
  phone: String,
  bio: String
});

module.exports = mongoose.model('User', userSchema);