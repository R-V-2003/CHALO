// CHALO Backend Server
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');

// Initialize database (creates tables + seeds data)
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/apiAuth').router);
app.use('/api/routes', require('./routes/apiRoutes'));
app.use('/api/drivers', require('./routes/apiDrivers'));
app.use('/api/reviews', require('./routes/apiReviews'));
app.use('/api/stops', require('./routes/apiStops'));

// AI Chat
app.use('/api/chat', require('./routes/apiChat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the Vite-built frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CHALO server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
