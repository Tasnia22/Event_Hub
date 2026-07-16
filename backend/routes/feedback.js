const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secretkey123');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// POST feedback
router.post('/', verifyToken, async (req, res) => {
  try {
    const { event, rating, comment } = req.body;
    if (!event || !rating) {
      return res.status(400).json({ message: 'Event and rating are required' });
    }

    const feedback = await Feedback.create({
      event,
      user: req.user.id,
      rating,
      comment: comment || ''
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET feedbacks for single event
router.get('/event/:eventId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('user', 'name photo')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET feedbacks for organizer's events
router.get('/organizer', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [{ organizer: req.user.id }, { coOrganizers: req.user.id }]
    });
    const eventIds = events.map(e => e._id);

    const feedbacks = await Feedback.find({ event: { $in: eventIds } })
      .populate('event', 'name')
      .populate('user', 'name photo')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
