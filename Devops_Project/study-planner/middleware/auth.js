/**
 * Authentication & Authorization Middleware
 */

// Ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please login to access this page.');
  res.redirect('/auth/login');
};

// Ensure user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  res.redirect('/dashboard');
};

// Redirect if already logged in
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

// Set local variables for templates
const setLocals = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.isAdmin = false;
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError = req.flash('error');
  res.locals.flashInfo = req.flash('info');

  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        res.locals.currentUser = user;
        res.locals.isAdmin = user.role === 'admin';
      }
    } catch (err) {
      console.error('setLocals error:', err);
    }
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, redirectIfAuthenticated, setLocals };
