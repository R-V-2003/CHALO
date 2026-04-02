// Routes API
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/routes - list all routes
router.get('/', (req, res) => {
  const routes = db.prepare(`
    SELECT r.*, 
      (SELECT COUNT(*) FROM stops WHERE route_id = r.id) as stop_count,
      (SELECT SUM(passengers) FROM stops WHERE route_id = r.id) as total_passengers
    FROM routes r
    ORDER BY r.created_at DESC
  `).all();

  // Attach stops and path to each route
  const stopsStmt = db.prepare('SELECT * FROM stops WHERE route_id = ? ORDER BY sort_order');
  const pathStmt = db.prepare('SELECT lat, lng FROM path_points WHERE route_id = ? ORDER BY sort_order');

  const result = routes.map(route => ({
    ...route,
    stops: stopsStmt.all(route.id),
    path: pathStmt.all(route.id).map(p => [p.lat, p.lng])
  }));

  res.json(result);
});

// GET /api/routes/:id - single route with full data
router.get('/:id', (req, res) => {
  const route = db.prepare('SELECT * FROM routes WHERE id = ?').get(req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });

  route.stops = db.prepare('SELECT * FROM stops WHERE route_id = ? ORDER BY sort_order').all(route.id);
  route.path = db.prepare('SELECT lat, lng FROM path_points WHERE route_id = ? ORDER BY sort_order')
    .all(route.id).map(p => [p.lat, p.lng]);

  res.json(route);
});

// POST /api/routes - create new route
router.post('/', (req, res) => {
  const { name, fare, distance, duration, color, stops, path } = req.body;

  if (!name || !stops || stops.length < 2) {
    return res.status(400).json({ error: 'Name and at least 2 stops required' });
  }

  const routeFare = fare || 10;
  const routeDistance = distance || 0;
  const routeDuration = duration || '10 min';
  const routeColor = color || '#4285F4';

  const insertRoute = db.prepare('INSERT INTO routes (name, fare, distance, duration, color) VALUES (?, ?, ?, ?, ?)');
  const insertStop = db.prepare('INSERT INTO stops (route_id, name, lat, lng, passengers, distance_label, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertPath = db.prepare('INSERT INTO path_points (route_id, lat, lng, sort_order) VALUES (?, ?, ?, ?)');

  const create = db.transaction(() => {
    const result = insertRoute.run(name, routeFare, routeDistance, routeDuration, routeColor);
    const routeId = result.lastInsertRowid;

    stops.forEach((stop, i) => {
      insertStop.run(routeId, stop.name, stop.lat, stop.lng, stop.passengers || 0, stop.distance_label || '0 m', i);
    });

    if (path && path.length > 0) {
      path.forEach(([lat, lng], i) => {
        insertPath.run(routeId, lat, lng, i);
      });
    } else {
      // Auto-generate path from stops
      stops.forEach((stop, i) => {
        insertPath.run(routeId, stop.lat, stop.lng, i);
      });
    }

    return routeId;
  });

  try {
    const routeId = create();
    const newRoute = db.prepare('SELECT * FROM routes WHERE id = ?').get(routeId);
    newRoute.stops = db.prepare('SELECT * FROM stops WHERE route_id = ? ORDER BY sort_order').all(routeId);
    newRoute.path = db.prepare('SELECT lat, lng FROM path_points WHERE route_id = ? ORDER BY sort_order')
      .all(routeId).map(p => [p.lat, p.lng]);
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/routes/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM routes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Route not found' });
  res.json({ success: true });
});

module.exports = router;
