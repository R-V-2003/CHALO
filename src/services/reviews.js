// Reviews service - localStorage backed

import { storage } from '../utils/storage.js';

const REVIEWS_KEY = 'reviews';

export function getReviews(driverId) {
  const all = storage.get(REVIEWS_KEY, {});
  return all[driverId] || [];
}

export function addReview(driverId, review) {
  const all = storage.get(REVIEWS_KEY, {});
  if (!all[driverId]) all[driverId] = [];
  
  all[driverId].unshift({
    id: Date.now().toString(),
    rating: review.rating,
    text: review.text,
    date: new Date().toISOString(),
    userName: 'You'
  });

  storage.set(REVIEWS_KEY, all);
  return all[driverId];
}

export function getAverageRating(driverId, defaultRating = 4.0) {
  const reviews = getReviews(driverId);
  if (reviews.length === 0) return defaultRating;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
