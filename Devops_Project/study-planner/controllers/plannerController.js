const Task = require('../models/Task');
const { calculateAIScore, generateTimetable, rescheduleOverdueTasks, getNextRecommendation } = require('../ai/scheduler');

// GET /planner
exports.index = async (req, res) => {
  try {
    const { search, status, subject, priority, sort } = req.query;
    const query = { user: req.session.userId };

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (priority) query.priority = priority;

    let sortObj = { deadline: 1 };
    if (sort === 'priority') sortObj = { aiScore: -1 };
    else if (sort === 'created') sortObj = { createdAt: -1 };
    else if (sort === 'subject') sortObj = { subject: 1 };

    const tasks = await Task.find(query).sort(sortObj).lean();

    // Annotate with AI score
    const scoredTasks = tasks.map(t => ({
      ...t,
      aiScore: calculateAIScore(t),
      daysLeft: Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    const subjects = await Task.distinct('subject', { user: req.session.userId });
    const recommendation = getNextRecommendation(await Task.find({ user: req.session.userId, status: { $in: ['pending', 'in-progress'] } }));

    res.render('planner/index', {
      title: 'Study Tasks — Study Planner',
      tasks: scoredTasks,
      subjects,
      filters: { search, status, subject, priority, sort },
      recommendation
    });
  } catch (err) {
    console.error('Planner index error:', err);
    req.flash('error', 'Failed to load tasks.');
    res.redirect('/dashboard');
  }
};

// GET /planner/create
exports.getCreate = (req, res) => {
  res.render('planner/create', { title: 'Create Task — Study Planner', task: {} });
};

// POST /planner
exports.postCreate = async (req, res) => {
  try {
    const { subject, topic, description, deadline, priority, difficulty, estimatedHours, notes, tags } = req.body;

    const task = new Task({
      user: req.session.userId,
      subject: subject.trim(),
      topic: topic.trim(),
      description: description?.trim(),
      deadline: new Date(deadline),
      priority: priority || 'medium',
      difficulty: difficulty || 'medium',
      estimatedHours: parseFloat(estimatedHours) || 1,
      notes: notes?.trim(),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    });

    task.aiScore = calculateAIScore(task);
    await task.save();

    req.flash('success', `✅ Task "${topic}" created and scheduled by AI!`);
    res.redirect('/planner');
  } catch (err) {
    console.error('Create task error:', err);
    req.flash('error', 'Failed to create task. ' + (err.message || ''));
    res.redirect('/planner/create');
  }
};

// GET /planner/:id
exports.show = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId }).lean();
    if (!task) {
      req.flash('error', 'Task not found.');
      return res.redirect('/planner');
    }
    task.aiScore = calculateAIScore(task);
    task.daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    res.render('planner/show', { title: `${task.topic} — Study Planner`, task });
  } catch (err) {
    console.error('Show task error:', err);
    res.redirect('/planner');
  }
};

// GET /planner/:id/edit
exports.getEdit = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId }).lean();
    if (!task) {
      req.flash('error', 'Task not found.');
      return res.redirect('/planner');
    }
    res.render('planner/edit', { title: `Edit ${task.topic} — Study Planner`, task });
  } catch (err) {
    res.redirect('/planner');
  }
};

// PUT /planner/:id
exports.putEdit = async (req, res) => {
  try {
    const { subject, topic, description, deadline, priority, difficulty, estimatedHours, status, actualHours, notes, tags } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
    if (!task) {
      req.flash('error', 'Task not found.');
      return res.redirect('/planner');
    }

    task.subject = subject.trim();
    task.topic = topic.trim();
    task.description = description?.trim();
    task.deadline = new Date(deadline);
    task.priority = priority;
    task.difficulty = difficulty;
    task.estimatedHours = parseFloat(estimatedHours) || task.estimatedHours;
    task.status = status;
    task.actualHours = parseFloat(actualHours) || 0;
    task.notes = notes?.trim();
    task.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    }

    task.aiScore = calculateAIScore(task);
    await task.save();

    req.flash('success', 'Task updated successfully!');
    res.redirect(`/planner/${task._id}`);
  } catch (err) {
    console.error('Edit task error:', err);
    req.flash('error', 'Failed to update task.');
    res.redirect(`/planner/${req.params.id}/edit`);
  }
};

// DELETE /planner/:id
exports.delete = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    req.flash('success', 'Task deleted.');
    res.redirect('/planner');
  } catch (err) {
    req.flash('error', 'Failed to delete task.');
    res.redirect('/planner');
  }
};

// GET /planner/ai-schedule
exports.getAISchedule = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.session.userId, status: { $in: ['pending', 'in-progress'] } });
    const rescheduled = rescheduleOverdueTasks(tasks, res.locals.currentUser.studyHoursPerDay || 4);

    const subjects = tasks.map(t => ({
      subject: t.subject,
      topic: t.topic,
      deadline: t.deadline,
      priority: t.priority,
      difficulty: t.difficulty,
      estimatedHours: t.estimatedHours
    }));

    const timetable = generateTimetable({
      subjects,
      dailyHours: res.locals.currentUser.studyHoursPerDay || 4,
      startDate: new Date()
    });

    res.render('planner/ai-schedule', {
      title: 'AI Schedule — Study Planner',
      timetable,
      rescheduled,
      tasks
    });
  } catch (err) {
    console.error('AI schedule error:', err);
    req.flash('error', 'Failed to generate AI schedule.');
    res.redirect('/planner');
  }
};

// POST /planner/:id/complete
exports.markComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
      await task.save();
      req.flash('success', '🎉 Task marked as complete!');
    }
    res.redirect('/planner');
  } catch (err) {
    req.flash('error', 'Failed to update task.');
    res.redirect('/planner');
  }
};
