const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: false,          // false for localhost (no HTTPS)
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000,
    sameSite: 'lax'
  },
  name: 'study.planner.sid'
};

module.exports = sessionConfig;
