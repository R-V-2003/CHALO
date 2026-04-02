// Reviews API
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reviews/:driverId
router.get('/:driverId', (req, res) => {
  const reviews = db.prepare(
    'SELECT * FROM reviews WHERE driver_id = ? ORDER BY created_at DESC'
  ).all(req.params.driverId);
  res.json(reviews);
});

// POST /api/reviews/:driverId
router.post('/:driverId', (req, res) => {
  const { rating, text, user_name } = req.body;
  const driverId = parseInt(req.params.driverId);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }

  const stmt = db.prepare(
    'INSERT INTO reviews (driver_id, rating, text, user_name) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(driverId, rating, text || '', user_name || 'Anonymous');

  // Update driver average rating
  const avg = db.prepare(
    'SELECT AVG(rating) as avg_rating FROM reviews WHERE driver_id = ?'
  ).get(driverId);

  if (avg && avg.avg_rating) {
    db.prepare('UPDATE drivers SET rating = ? WHERE id = ?')
      .run(Math.round(avg.avg_rating * 10) / 10, driverId);
  }

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(review);
});

module.exports = router;
