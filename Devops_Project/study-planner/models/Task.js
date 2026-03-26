const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  estimatedHours: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 50
  },
  actualHours: {
    type: Number,
    default: 0
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  aiScore: {
    type: Number,
    default: 0 // AI priority score
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, subject: 1 });

// Auto-mark overdue tasks
taskSchema.pre('find', function () {
  // This runs before find queries
});

// Virtual: days until deadline
taskSchema.virtual('daysUntilDeadline').get(function () {
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Mark completed
taskSchema.methods.markCompleted = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Get study hours per subject for chart
taskSchema.statics.getStudyHoursBySubject = async function (userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$subject', totalHours: { $sum: '$estimatedHours' }, count: { $sum: 1 } } },
    { $sort: { totalHours: -1 } }
  ]);
};

// Get weekly activity
taskSchema.statics.getWeeklyActivity = async function (userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        hours: { $sum: '$estimatedHours' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);
