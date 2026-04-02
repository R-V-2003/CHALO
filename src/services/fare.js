// Fare calculation service

const BASE_FARE = 5;       // ₹5 base
const PER_KM_RATE = 2;     // ₹2 per km (shared rate)
const MIN_FARE = 8;        // Minimum fare

export function calculateFare(distanceKm) {
  const fare = BASE_FARE + (distanceKm * PER_KM_RATE);
  return Math.max(MIN_FARE, Math.round(fare));
}

export function formatFare(amount) {
  return `₹${amount}`;
}

export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
