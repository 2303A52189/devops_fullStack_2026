const User = require('../models/User');
const Task = require('../models/Task');

// GET /users (admin only)
exports.index = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

    // Enrich with task stats
    const enriched = await Promise.all(users.map(async (u) => {
      const total = await Task.countDocuments({ user: u._id });
      const completed = await Task.countDocuments({ user: u._id, status: 'completed' });
      return { ...u, taskTotal: total, taskCompleted: completed };
    }));

    res.render('users/index', {
      title: 'User Management — Study Planner',
      users: enriched
    });
  } catch (err) {
    console.error('Users index error:', err);
    req.flash('error', 'Failed to load users.');
    res.redirect('/dashboard');
  }
};

// PUT /users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      req.flash('error', 'Invalid role.');
      return res.redirect('/users');
    }

    // Prevent self-demotion
    if (req.params.id === req.session.userId) {
      req.flash('error', 'You cannot change your own role.');
      return res.redirect('/users');
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash('success', 'User role updated.');
    res.redirect('/users');
  } catch (err) {
    req.flash('error', 'Failed to update role.');
    res.redirect('/users');
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.session.userId) {
      req.flash('error', 'You cannot delete your own account.');
      return res.redirect('/users');
    }

    await User.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ user: req.params.id });
    req.flash('success', 'User and their tasks deleted.');
    res.redirect('/users');
  } catch (err) {
    req.flash('error', 'Failed to delete user.');
    res.redirect('/users');
  }
};

// PUT /users/:id/toggle-active
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/users');
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    req.flash('success', `User ${user.isActive ? 'activated' : 'deactivated'}.`);
    res.redirect('/users');
  } catch (err) {
    req.flash('error', 'Failed to toggle user status.');
    res.redirect('/users');
  }
};
