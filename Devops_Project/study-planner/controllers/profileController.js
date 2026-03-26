const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password').lean();
    if (!user) return res.redirect('/auth/login');
    res.render('profile/index', { title: 'My Profile — Study Planner', user });
  } catch (err) {
    req.flash('error', 'Failed to load profile.');
    res.redirect('/dashboard');
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, studyHoursPerDay } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) return res.redirect('/auth/login');

    // Check email uniqueness
    if (email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        req.flash('error', 'Email already in use by another account.');
        return res.redirect('/profile');
      }
    }

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.studyHoursPerDay = parseInt(studyHoursPerDay) || 4;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar
      if (user.avatar) {
        const oldPath = path.join(__dirname, '../public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save({ validateBeforeSave: false });
    req.session.userName = user.name;

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Profile update error:', err);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profile');
  }
};

// PUT /profile/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) return res.redirect('/auth/login');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/profile');
    }

    if (newPassword.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/profile');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success', 'Password changed successfully!');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Failed to change password.');
    res.redirect('/profile');
  }
};
