const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ticketName: String,
  ticketType: String,
  attendeeName: String,
  attendeeEmail: String,
  amountPaid: Number,
  ticketNumber: { type: String, unique: true },
  qrImage: String,
  checkedIn: { type: Boolean, default: false },
  paymentStatus: { type: String, default: 'paid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);