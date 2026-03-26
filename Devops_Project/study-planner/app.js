require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('express-flash');
const session = require('express-session');

const connectDB = require('./config/database');
const sessionConfig = require('./config/session');
const { setLocals } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const plannerRoutes = require('./routes/planner');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const dashboardController = require('./controllers/dashboardController');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Connect Database
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Body Parsers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Method Override (for PUT/DELETE via forms)
app.use(methodOverride('_method'));

// Session
app.use(session(sessionConfig));

// Flash Messages
app.use(flash());

// Global template locals
app.use(setLocals);

// ─── Routes ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

app.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

app.use('/auth', authRoutes);
app.use('/planner', plannerRoutes);
app.use('/users', userRoutes);
app.use('/profile', profileRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 — Page Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).render('500', { title: '500 — Server Error', error: err.message });
});

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Study Planner running at http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
