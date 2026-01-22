// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection (FIXED)
mongoose.connect('mongodb://localhost:27017/eventDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  participants: { type: [String], default: [] }
}, { timestamps: true });

// Event Model
const Event = mongoose.model('Event', eventSchema);

// ---------------- CRUD OPERATIONS ----------------

// CREATE Event
app.post('/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ Events (Pagination + Search)
app.get('/events', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    const query = { title: { $regex: search, $options: 'i' } };

    const events = await Event.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      events
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE Event
app.put('/events/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Event ID' });
  }

  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Event
app.delete('/events/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Event ID' });
  }

  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});