const Task = require('../models/Task');
const User = require('../models/User');
const { getNextRecommendation, generateWeeklyPlan, calculateAIScore } = require('../ai/scheduler');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Fetch task statistics
    const [total, completed, pending, inProgress] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'pending' }),
      Task.countDocuments({ user: userId, status: 'in-progress' })
    ]);

    // Update overdue tasks
    await Task.updateMany(
      { user: userId, status: 'pending', deadline: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    const overdue = await Task.countDocuments({ user: userId, status: 'overdue' });

    // Chart data: study hours per subject
    const subjectData = await Task.getStudyHoursBySubject(userId);

    // Chart data: weekly activity
    const weeklyData = await Task.getWeeklyActivity(userId);

    // Recent tasks
    const recentTasks = await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // AI Recommendation
    const allPendingTasks = await Task.find({ user: userId, status: { $in: ['pending', 'in-progress'] } });
    const recommendation = getNextRecommendation(allPendingTasks);

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = await Task.find({
      user: userId,
      status: { $in: ['pending', 'in-progress'] },
      deadline: { $lte: nextWeek, $gte: new Date() }
    }).sort({ deadline: 1 }).limit(5).lean();

    // Weekly plan
    const weeklyPlan = generateWeeklyPlan(allPendingTasks, res.locals.currentUser.studyHoursPerDay || 4);

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Build weekly chart labels/data
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyHours = Array(7).fill(0);
    weeklyData.forEach(d => {
      weeklyHours[(d._id - 1 + 7) % 7] = parseFloat(d.hours.toFixed(1));
    });

    res.render('dashboard/index', {
      title: 'Dashboard — Study Planner',
      stats: { total, completed, pending, inProgress, overdue, completionRate },
      subjectData: JSON.stringify(subjectData),
      weeklyHours: JSON.stringify(weeklyHours),
      dayLabels: JSON.stringify(dayLabels),
      recentTasks,
      recommendation,
      upcomingDeadlines,
      weeklyPlan
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/auth/login');
  }
};
