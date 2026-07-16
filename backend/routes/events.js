const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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

// CREATE EVENT
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, startDateTime, endDateTime, venue, description, ticketTiers, coOrganizerIds } = req.body;
    const eventData = {
      name, startDateTime, endDateTime, venue, description,
      organizer: req.user.id,
      ticketOptions: ticketTiers ? JSON.parse(ticketTiers) : [],
      coOrganizers: coOrganizerIds ? JSON.parse(coOrganizerIds) : []
    };
    if (req.file) eventData.image = `http://localhost:5000/uploads/${req.file.filename}`;
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL EVENTS
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name').populate('coOrganizers', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DASHBOARD STATS
router.get('/organizer/stats', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [{ organizer: req.user.id }, { coOrganizers: req.user.id }]
    });
    const eventIds = events.map(e => e._id);
    const tickets = await Ticket.find({ event: { $in: eventIds } });

    const totalRevenue = tickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    const totalTicketsSold = tickets.length;
    const totalAttendance = tickets.filter(t => t.checkedIn).length;
    const totalEvents = events.length;

    res.json({ totalRevenue, totalTicketsSold, totalAttendance, totalEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET MY EVENTS (organizer, includes co-organized)
router.get('/organizer/my-events', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [{ organizer: req.user.id }, { coOrganizers: req.user.id }]
    }).populate('organizer', 'name').populate('coOrganizers', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE EVENT
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name').populate('coOrganizers', 'name');
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE EVENT
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOwner = event.organizer.toString() === req.user.id;
    const isCoOrganizer = event.coOrganizers.map(id => id.toString()).includes(req.user.id);
    if (!isOwner && !isCoOrganizer) return res.status(403).json({ message: 'Not authorized' });

    const { name, startDateTime, endDateTime, venue, description, ticketTiers, coOrganizerIds } = req.body;

    event.name = name;
    event.startDateTime = startDateTime;
    event.endDateTime = endDateTime;
    event.venue = venue;
    event.description = description;
    if (ticketTiers) event.ticketOptions = JSON.parse(ticketTiers);
    if (coOrganizerIds) event.coOrganizers = JSON.parse(coOrganizerIds);
    if (req.file) event.image = `http://localhost:5000/uploads/${req.file.filename}`;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE EVENT (only main organizer can delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await Ticket.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;