// API Client — all data comes from the backend
import { storage } from './utils/storage.js';
const BASE = '';  // Same origin in production, proxied in dev

async function request(path, options = {}) {
  try {
    const token = storage.get('auth_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  } catch (err) {
    console.error(`API Error [${path}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Routes
  getRoutes: () => request('/api/routes'),
  getRoute: (id) => request(`/api/routes/${id}`),
  createRoute: (data) => request('/api/routes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteRoute: (id) => request(`/api/routes/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers: () => request('/api/drivers'),
  getDriverForRoute: (routeId) => request(`/api/drivers/route/${routeId}`),

  // Reviews
  getReviews: (driverId) => request(`/api/reviews/${driverId}`),
  addReview: (driverId, data) => request(`/api/reviews/${driverId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Stops
  getStops: (routeId) => request(`/api/stops/${routeId}`),

  // Auth & User
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),

  // Shuttle Specific
  setShuttleRoute: (routeId) => request('/api/auth/shuttle/route', { method: 'POST', body: JSON.stringify({ routeId }) }),

  // Health
  health: () => request('/api/health')
};
