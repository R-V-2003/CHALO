// Authentication API
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chalo-super-secret-key-2025';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, phone, password, role } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, phone, and password required' });
  }

  const userRole = role === 'shuttle' ? 'shuttle' : 'passenger';
  
  // Check if phone exists
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    return res.status(400).json({ error: 'Phone number already registered' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const stmt = db.prepare('INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, phone, hash, userRole);
    
    const token = jwt.sign({ id: result.lastInsertRowid, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, name, phone, role: userRole, profile_photo: '' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, active_route_id: user.active_route_id, profile_photo: user.profile_photo }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Middleware to verify token (optional export if needed by other routes)
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, name, phone, role, active_route_id, profile_photo FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/auth/shuttle/route
// Allows a shuttle driver to set their active route
router.post('/shuttle/route', verifyToken, (req, res) => {
  if (req.user.role !== 'shuttle') {
    return res.status(403).json({ error: 'Only shuttles can set active routes' });
  }
  const { routeId } = req.body; // routeId can be null to stop driving
  
  db.prepare('UPDATE users SET active_route_id = ? WHERE id = ?').run(routeId || null, req.user.id);
  res.json({ success: true, active_route_id: routeId || null });
});

module.exports = { router, verifyToken };
