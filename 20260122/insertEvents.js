const mongoose = require('mongoose');

// MongoDB connection (LATEST & CORRECT)
mongoose
  .connect('mongodb://localhost:27017/eventDB')
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB connection error:', err));

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
    title: "Tech Conference 2023",
    date: new Date("2023-11-25T09:00:00Z"),
    location: "New York",
    participants: ["John Doe", "Jane Smith", "Alice Brown"]
  },
  {
    title: "AI/ML Workshop",
    date: new Date("2023-12-05T10:00:00Z"),
    location: "San Francisco",
    participants: ["Michael Clark", "Emma Wilson", "David Lee"]
  }
];

// Insert records
async function insertEvents() {
  try {
    await Event.insertMany(events);
    console.log("Events inserted successfully 🎉");
  } catch (err) {
    console.log("Error inserting events:", err);
  } finally {
    mongoose.connection.close();
  }
}

insertEvents();