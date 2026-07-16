const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');


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

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ message: 'Signup successful', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey123', { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo, phone: user.phone, bio: user.bio } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.put('/profile', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { name, password, phone, bio } = req.body;
    const updateData = { name, phone, bio };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      updateData.photo = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo, phone: user.phone, bio: user.bio });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEARCH ORGANIZERS (for co-organizer feature)
router.get('/search-organizers', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const users = await User.find({
      role: 'organizer',
      _id: { $ne: req.user.id },
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    }).select('name email photo').limit(5);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE PROFILE
router.delete('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'organizer') {
      // Find all events where this user is the organizer
      const events = await Event.find({ organizer: userId });
      const eventIds = events.map(e => e._id);

      // Delete all tickets and feedbacks associated with these events
      await Ticket.deleteMany({ event: { $in: eventIds } });
      await Feedback.deleteMany({ event: { $in: eventIds } });

      // Delete the events hosted by this organizer
      await Event.deleteMany({ organizer: userId });

      // Remove this user from any co-organizer list of other events
      await Event.updateMany(
        { coOrganizers: userId },
        { $pull: { coOrganizers: userId } }
      );
    } else {
      // Customer: Delete all tickets booked by the user
      const tickets = await Ticket.find({ buyer: userId });
      const ticketIds = tickets.map(t => t._id);

      // Restock the ticket quantities for each event where tickets are deleted
      for (const ticket of tickets) {
        if (ticket.event) {
          await Event.updateOne(
            { _id: ticket.event, 'ticketOptions.name': ticket.ticketName },
            { $inc: { 'ticketOptions.$.quantity': 1 } }
          );
        }
      }

      await Ticket.deleteMany({ buyer: userId });
    }

    // Delete feedback written by this user
    await Feedback.deleteMany({ user: userId });

    // Delete user notifications
    await Notification.deleteMany({ user: userId });

    // Delete the user profile
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;