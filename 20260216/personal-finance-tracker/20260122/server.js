// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  participants: { type: [String], default: [] }
});

// Event Model
const Event = mongoose.model('Event', eventSchema);

// CRUD Operations

// CREATE Event
app.post('/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send(err);
  }
});

// READ Event(s)
app.get('/events', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  try {
    const events = await Event.find({ title: { $regex: search, $options: 'i' } })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Event.countDocuments({ title: { $regex: search, $options: 'i' } });
    res.status(200).json({ events, total, page });
  } catch (err) {
    res.status(400).send(err);
  }
});

// UPDATE Event
app.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).send('Event not found');
    res.status(200).send(event);
  } catch (err) {
    res.status(400).send(err);
  }
});

// DELETE Event
app.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).send('Event not found');
    res.status(200).send('Event deleted');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Start Server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});