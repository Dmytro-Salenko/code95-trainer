require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables Defaults
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'driver95pass';
const SESSION_SECRET = process.env.SESSION_SECRET || 'driver95-secret-key-123';

// Setup database
const dbFile = path.join(__dirname, 'analytics.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      anonymous_user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      language TEXT,
      mode TEXT,
      question_id INTEGER,
      is_correct INTEGER,
      time_spent INTEGER,
      device_type TEXT,
      app_version TEXT,
      question_database_version TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Middleware
app.parseJson = express.json();
app.use(app.parseJson);
app.use(cookieParser());

// Auth check helper
function getAdminFromToken(req) {
  const token = req.cookies.admin_token;
  if (!token) return null;
  try {
    return jwt.verify(token, SESSION_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const admin = getAdminFromToken(req);
  if (!admin) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.redirect('/admin/login');
  }
  next();
}

// Routes
// POST /api/analytics is completely public
app.post('/api/analytics', (req, res) => {
  const {
    event_name,
    anonymous_user_id,
    session_id,
    timestamp,
    language,
    mode,
    question_id,
    selected_answer,
    correct_answer,
    is_correct,
    time_spent,
    device_type,
    app_version,
    question_database_version,
    metadata
  } = req.body;

  if (!event_name || !anonymous_user_id || !session_id || !timestamp) {
    return res.status(400).json({ error: 'Missing required analytics fields' });
  }

  // Build metadata combining event specific properties
  const extraMetadata = {
    selected_answer,
    correct_answer,
    ...(metadata || {})
  };

  const sql = `
    INSERT INTO events (
      event_name, anonymous_user_id, session_id, timestamp, language, mode,
      question_id, is_correct, time_spent, device_type, app_version,
      question_database_version, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const isCorrectVal = typeof is_correct === 'boolean' ? (is_correct ? 1 : 0) : null;

  db.run(
    sql,
    [
      event_name,
      anonymous_user_id,
      session_id,
      timestamp,
      language,
      mode,
      question_id,
      isCorrectVal,
      time_spent,
      device_type,
      app_version,
      question_database_version,
      JSON.stringify(extraMetadata)
    ],
    function (err) {
      if (err) {
        console.error('Error inserting event:', err.message);
        return res.status(500).json({ error: 'Database write failed' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Admin Authentication Endpoints
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, SESSION_SECRET, { expiresIn: '1d' });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/admin/logout', requireAuth, (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

// Protected Admin UI & Stats
app.get('/admin/login', (req, res) => {
  const admin = getAdminFromToken(req);
  if (admin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/stats', requireAuth, (req, res) => {
  const stats = {};

  const queryPromise = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  const getSingleVal = (sql, params = []) => {
    return queryPromise(sql, params).then(rows => Object.values(rows[0] || {})[0]);
  };

  Promise.all([
    // Overview Cards
    getSingleVal("SELECT COUNT(DISTINCT anonymous_user_id) FROM events"), // total_users
    getSingleVal("SELECT COUNT(DISTINCT anonymous_user_id) FROM events WHERE date(timestamp) = date('now')"), // users_today
    getSingleVal("SELECT COUNT(DISTINCT anonymous_user_id) FROM events WHERE date(timestamp) = date('now', '-1 day')"), // users_yesterday
    getSingleVal("SELECT COUNT(DISTINCT session_id) FROM events"), // total_sessions
    getSingleVal("SELECT AVG(duration) FROM (SELECT (strftime('%s', MAX(timestamp)) - strftime('%s', MIN(timestamp))) as duration FROM events GROUP BY session_id)"), // avg_session_duration
    getSingleVal("SELECT AVG(time_spent) FROM events WHERE event_name = 'question_answered'"), // avg_thinking_time

    // Charts: Daily Active Users & Sessions (last 30 days)
    queryPromise(`
      SELECT date(timestamp) as date, COUNT(DISTINCT anonymous_user_id) as users, COUNT(DISTINCT session_id) as sessions
      FROM events
      GROUP BY date(timestamp)
      ORDER BY date(timestamp) DESC
      LIMIT 30
    `),

    // Charts: Language popularity
    queryPromise("SELECT language, COUNT(DISTINCT anonymous_user_id) as count FROM events GROUP BY language"),

    // Charts: Exam Completion metrics
    getSingleVal("SELECT COUNT(*) FROM events WHERE event_name = 'test_started' AND mode = 'exam'"),
    getSingleVal("SELECT COUNT(*) FROM events WHERE event_name = 'test_finished' AND mode = 'exam'"),
    getSingleVal("SELECT COUNT(*) FROM events WHERE event_name = 'test_abandoned' AND mode = 'exam'"),

    // Charts: PWA installs
    getSingleVal("SELECT COUNT(*) FROM events WHERE event_name = 'pwa_installed'"),

    // Top 20 Most Difficult Questions
    queryPromise(`
      SELECT question_id, COUNT(*) as total, SUM(is_correct) as correct, 
             (1.0 - (CAST(SUM(is_correct) AS REAL) / COUNT(*))) * 100 as failure_rate,
             AVG(time_spent) as avg_time
      FROM events
      WHERE event_name = 'question_answered' AND question_id IS NOT NULL
      GROUP BY question_id
      ORDER BY failure_rate DESC, total DESC
      LIMIT 20
    `),

    // Versions breakdown
    queryPromise("SELECT app_version, COUNT(DISTINCT anonymous_user_id) as count FROM events GROUP BY app_version"),
    queryPromise("SELECT question_database_version, COUNT(DISTINCT anonymous_user_id) as count FROM events GROUP BY question_database_version")
  ]).then(([
    total_users,
    users_today,
    users_yesterday,
    total_sessions,
    avg_session_duration,
    avg_thinking_time,
    daily_activity,
    languages,
    exams_started,
    exams_finished,
    exams_abandoned,
    pwa_installs,
    difficult_questions,
    app_versions,
    db_versions
  ]) => {
    res.json({
      overview: {
        total_users: total_users || 0,
        users_today: users_today || 0,
        users_yesterday: users_yesterday || 0,
        total_sessions: total_sessions || 0,
        avg_session_duration: Math.round(avg_session_duration || 0),
        avg_thinking_time: Math.round(avg_thinking_time || 0)
      },
      daily_activity: daily_activity.reverse(),
      languages,
      exams: {
        started: exams_started || 0,
        finished: exams_finished || 0,
        abandoned: exams_abandoned || 0,
        completion_rate: exams_started ? Math.round((exams_finished / exams_started) * 100) : 0
      },
      pwa_installs: pwa_installs || 0,
      difficult_questions,
      app_versions,
      db_versions
    });
  }).catch(err => {
    console.error('Error generating statistics:', err);
    res.status(500).json({ error: 'Failed to aggregate statistics' });
  });
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA routes (if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
