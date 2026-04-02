// Driver profiles - mock data

export const drivers = [
  {
    id: 'driver-1',
    name: 'Ashok R',
    vehicleNumber: 'GJ01BX1234',
    rating: 4.2,
    totalRides: 1580,
    photo: null, // Will use avatar placeholder
    routeId: 'route-1',
  },
  {
    id: 'driver-2',
    name: 'Ramesh Patel',
    vehicleNumber: 'GJ01CK5678',
    rating: 4.5,
    totalRides: 2340,
    photo: null,
    routeId: 'route-2',
  },
  {
    id: 'driver-3',
    name: 'Suresh Kumar',
    vehicleNumber: 'GJ01DL9012',
    rating: 3.8,
    totalRides: 890,
    photo: null,
    routeId: 'route-3',
  },
  {
    id: 'driver-4',
    name: 'Vikram Singh',
    vehicleNumber: 'GJ01AM3456',
    rating: 4.7,
    totalRides: 3200,
    photo: null,
    routeId: 'route-4',
  },
  {
    id: 'driver-5',
    name: 'Mehul Shah',
    vehicleNumber: 'GJ01BN7890',
    rating: 4.0,
    totalRides: 1120,
    photo: null,
    routeId: 'route-5',
  },
  {
    id: 'driver-6',
    name: 'Prakash Joshi',
    vehicleNumber: 'GJ01CP2345',
    rating: 4.3,
    totalRides: 1760,
    photo: null,
    routeId: 'route-6',
  },
];

export function getDriverForRoute(routeId) {
  return drivers.find(d => d.routeId === routeId) || drivers[0];
}

export function getDriverById(id) {
  return drivers.find(d => d.id === id);
}

// Generate avatar SVG placeholder with initials
export function getDriverAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#4285F4', '#EA4335', '#34A853', '#FBBC04', '#9C27B0', '#FF5722'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="${bg}"/>
      <text x="32" y="38" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `)}`;
}
