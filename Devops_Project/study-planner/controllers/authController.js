const User = require('../models/User');

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login — Study Planner' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/auth/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated. Contact admin.');
      return res.redirect('/auth/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set session and explicitly save before redirect
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;
    req.session.userName = user.name;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.flash('error', 'Login failed due to session error. Please try again.');
        return res.redirect('/auth/login');
      }
      req.flash('success', `Welcome back, ${user.name}! 🎓`);
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// GET /auth/register
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register — Study Planner' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validations
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/auth/register');
    }

    // Only allow admin role if no admin exists yet
    let assignedRole = 'user';
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        assignedRole = 'admin';
      }
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole
    });

    await user.save();

    req.flash('success', 'Account created successfully! Please log in.');
    req.session.save(() => res.redirect('/auth/login'));
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      req.flash('error', 'Email already registered.');
    } else {
      req.flash('error', 'Registration failed. Please try again.');
    }
    res.redirect('/auth/register');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('study.planner.sid');
    res.redirect('/auth/login');
  });
};
