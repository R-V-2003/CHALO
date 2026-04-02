// Script to update existing routes with real road geometry using OSRM
const db = require('./db');

async function getRouteGeometry(stops) {
  if (stops.length < 2) return [];
  
  // OSRM expects: longitude,latitude separated by ;
  const coordsStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // OSRM returns coordinates as [lng, lat], our DB expects [lat, lng]
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    return [];
  } catch (err) {
    console.error('OSRM fetch error:', err);
    return [];
  }
}

async function updateAllRoutes() {
  console.log('Fetching real road geometry for all routes...');
  const routes = db.prepare('SELECT id, name FROM routes').all();
  
  const getStops = db.prepare('SELECT lat, lng FROM stops WHERE route_id = ? ORDER BY sort_order');
  const deletePath = db.prepare('DELETE FROM path_points WHERE route_id = ?');
  const insertPath = db.prepare('INSERT INTO path_points (route_id, lat, lng, sort_order) VALUES (?, ?, ?, ?)');
  
  for (const route of routes) {
    const stops = getStops.all(route.id);
    console.log(`Processing "${route.name}" (${stops.length} stops)...`);
    
    const detailedPath = await getRouteGeometry(stops);
    
    if (detailedPath.length > 0) {
      db.transaction(() => {
        deletePath.run(route.id);
        detailedPath.forEach(([lat, lng], i) => {
          insertPath.run(route.id, lat, lng, i);
        });
      })();
      console.log(`✅ Updated "${route.name}" with ${detailedPath.length} detailed coordinates.`);
    } else {
      console.log(`❌ Failed to get geometry for "${route.name}".`);
    }
    
    // Sleep 1 second to respect OSRM public API limits
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Finished updating routes! Refresh the browser to see the snapped routes.');
}

updateAllRoutes();
