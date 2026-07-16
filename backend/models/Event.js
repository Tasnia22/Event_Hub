const mongoose = require('mongoose');

const ticketOptionSchema = new mongoose.Schema({
  type: { type: String, enum: ['free', 'fixed', 'donation'] },
  name: String,
  price: Number,
  quantity: Number
});

const eventSchema = new mongoose.Schema({
  name: String,
  category: { type: String, default: 'General' },
  startDateTime: String,
  endDateTime: String,
  venue: String,
  image: String,
  description: String,
  ticketOptions: [ticketOptionSchema],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);