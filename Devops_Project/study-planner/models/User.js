const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  studyHoursPerDay: {
    type: Number,
    default: 4,
    min: 1,
    max: 16
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for task stats (populated manually)
userSchema.methods.getStats = async function () {
  const Task = mongoose.model('Task');
  const total = await Task.countDocuments({ user: this._id });
  const completed = await Task.countDocuments({ user: this._id, status: 'completed' });
  const pending = await Task.countDocuments({ user: this._id, status: 'pending' });
  const inProgress = await Task.countDocuments({ user: this._id, status: 'in-progress' });
  const subjects = await Task.distinct('subject', { user: this._id });
  return { total, completed, pending, inProgress, subjects: subjects.length };
};

module.exports = mongoose.model('User', userSchema);
