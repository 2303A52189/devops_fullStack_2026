const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/eventDB', { useNewUrlParser: true, useUnifiedTopology: true })
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

// Sample data
const events = [
  {
    "title": "Tech Conference 2023",
    "date": new Date("2023-11-25T09:00:00Z"),
    "location": "New York",
    "participants": ["John Doe", "Jane Smith", "Alice Brown"]
  },
  {
    "title": "AI/ML Workshop",
    "date": new Date("2023-12-05T10:00:00Z"),
    "location": "San Francisco",
    "participants": ["Michael Clark", "Emma Wilson", "David Lee"]
  },
  {
    "title": "Blockchain Summit",
    "date": new Date("2024-01-15T08:30:00Z"),
    "location": "London",
    "participants": ["Liam Johnson", "Sophia Davis", "Jackson Martinez"]
  },
  {
    "title": "Data Science Bootcamp",
    "date": new Date("2024-02-10T12:00:00Z"),
    "location": "Toronto",
    "participants": ["Isabella Garcia", "Ethan Moore", "Ava Rodriguez"]
  },
  {
    "title": "Cybersecurity Seminar",
    "date": new Date("2024-03-03T14:00:00Z"),
    "location": "Berlin",
    "participants": ["James Taylor", "Mia Anderson", "Lucas Thomas"]
  }
];

// Insert data
Event.insertMany(events)
  .then(() => {
    console.log('Events inserted successfully');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log('Error inserting events:', err);
    mongoose.connection.close();
  });