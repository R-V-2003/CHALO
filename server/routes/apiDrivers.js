// Drivers API
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/drivers - list all
router.get('/', (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers').all();
  res.json(drivers);
});

// GET /api/drivers/route/:routeId - by route
router.get('/route/:routeId', (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE route_id = ?').get(req.params.routeId);
  if (!driver) {
    // Return a default driver if none assigned
    return res.json({
      id: 0, name: 'Unknown Driver', vehicle_number: 'GJ01XX0000',
      rating: 4.0, total_rides: 0, route_id: parseInt(req.params.routeId)
    });
  }
  res.json(driver);
});

// GET /api/drivers/:id
router.get('/:id', (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json(driver);
});

module.exports = router;
