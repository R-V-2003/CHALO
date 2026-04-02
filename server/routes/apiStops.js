// Stops API
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stops/:routeId
router.get('/:routeId', (req, res) => {
  const stops = db.prepare(
    'SELECT * FROM stops WHERE route_id = ? ORDER BY sort_order'
  ).all(req.params.routeId);
  res.json(stops);
});

// PATCH /api/stops/:stopId/passengers - update passenger count
router.patch('/:stopId/passengers', (req, res) => {
  const { passengers } = req.body;
  if (passengers === undefined) return res.status(400).json({ error: 'passengers required' });

  db.prepare('UPDATE stops SET passengers = ? WHERE id = ?').run(passengers, req.params.stopId);
  const stop = db.prepare('SELECT * FROM stops WHERE id = ?').get(req.params.stopId);
  res.json(stop);
});

module.exports = router;
