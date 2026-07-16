const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secretkey123');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function generateTicketNumber() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return 'EVT-' + random;
}

// BOOK TICKET (simulated payment) - creates one ticket document PER attendee
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { eventId, ticketName, ticketType, attendees, amountPerTicket } = req.body;
    // attendees = [{ name, email }, { name, email }, ...]

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticketOption = event.ticketOptions.find(t => t.name === ticketName);
    if (!ticketOption) return res.status(400).json({ message: 'Ticket option not found' });
    if (ticketOption.quantity < attendees.length) return res.status(400).json({ message: 'Not enough tickets available' });

    ticketOption.quantity -= attendees.length;
    await event.save();

    const createdTickets = [];

    for (const attendee of attendees) {
      const ticketNumber = generateTicketNumber();
      const qrImage = await QRCode.toDataURL(ticketNumber);

      const ticket = await Ticket.create({
        event: eventId,
        buyer: req.user.id,
        ticketName,
        ticketType,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        amountPaid: amountPerTicket,
        ticketNumber,
        qrImage,
        paymentStatus: 'paid'
      });
      createdTickets.push(ticket);
    }

    await Notification.create({
      user: req.user.id,
      title: '🎟️ Booking Confirmed!',
      message: `You have successfully booked ${attendees.length} ticket(s) for "${event.name}".`
    });

    res.status(201).json(createdTickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET MY BOOKINGS (customer)
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ buyer: req.user.id }).populate('event');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL BOOKINGS FOR ORGANIZER'S EVENTS
router.get('/organizer-bookings', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [{ organizer: req.user.id }, { coOrganizers: req.user.id }]
    });
    const eventIds = events.map(e => e._id);
    const tickets = await Ticket.find({ event: { $in: eventIds } }).populate('event').populate('buyer', 'name email');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHECK-IN by ticket number
router.post('/checkin', verifyToken, async (req, res) => {
  try {
    const { ticketNumber } = req.body;
    const ticket = await Ticket.findOne({ ticketNumber }).populate('event');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.checkedIn) return res.status(400).json({ message: 'Already checked in', ticket });

    ticket.checkedIn = true;
    await ticket.save();

    await Notification.create({
      user: ticket.buyer,
      title: '✅ Ticket Checked-in!',
      message: `Your ticket for "${ticket.event.name}" (Attendee: ${ticket.attendeeName}) has been scanned and checked-in successfully.`
    });

    res.json({ message: 'Checked in successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET tickets for a specific event (for check-in list view)
router.get('/event/:eventId', verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;