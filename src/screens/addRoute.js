// Add Route Screen — interactive map to create new routes
import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { api } from '../api.js';
import { showToast } from '../utils/toast.js';

export function createAddRouteScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen add-route-screen';
  screen.id = 'add-route-screen';

  screen.innerHTML = `
    <div class="add-route-header">
      <button class="add-route-back" id="addroute-back">${icons.arrowLeft}</button>
      <h2>Add New Route</h2>
    </div>
    <div class="add-route-body">
      <div class="form-group">
        <label class="form-label">Route Name</label>
        <input class="form-input" id="route-name" type="text" placeholder="e.g. Gujarat University to Thaltej" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fare (₹)</label>
          <input class="form-input" id="route-fare" type="number" placeholder="10" min="1" />
        </div>
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input class="form-input" id="route-duration" type="text" placeholder="15 min" />
        </div>
      </div>
      <div class="form-group">
        <div class="mode-toggle">
          <button class="mode-btn active" id="mode-stops">📍 Add Stops</button>
          <button class="mode-btn" id="mode-path">✏️ Draw Path</button>
        </div>
        <div id="add-route-map"></div>
        <div class="map-action-bar">
          <div class="map-tap-hint" id="map-hint">📍 Tap map to add stops</div>
          <button class="btn-undo-point" id="btn-undo-point" style="display:none;">↩️ Undo</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Stops (<span id="stop-count">0</span>)</label>
        <div class="stops-list-form" id="stops-list-form">
          <div style="font-size:0.85rem;color:var(--text-muted);text-align:center;padding:12px;">
            No stops added yet. Tap the map above.
          </div>
        </div>
      </div>
      <button class="btn-save-route" id="btn-save-route" disabled>
        Save Route
      </button>
    </div>
  `;

  let addMap = null;
  let stops = [];
  let pathLine = null;
  let stopMarkers = [];
  let drawingMode = 'stops';
  let manualPath = [];
  let pathDotMarkers = [];

  setTimeout(() => {
    // Back
    screen.querySelector('#addroute-back')?.addEventListener('click', () => router.back());

    const modeStops = screen.querySelector('#mode-stops');
    const modePath = screen.querySelector('#mode-path');
    const mapHint = screen.querySelector('#map-hint');
    const undoBtn = screen.querySelector('#btn-undo-point');

    modeStops?.addEventListener('click', () => {
      drawingMode = 'stops';
      modeStops.classList.add('active');
      modePath.classList.remove('active');
      mapHint.textContent = '📍 Tap map to add stops';
      undoBtn.style.display = 'none';
    });

    modePath?.addEventListener('click', () => {
      drawingMode = 'path';
      modePath.classList.add('active');
      modeStops.classList.remove('active');
      mapHint.textContent = '✏️ Tap map to draw continuous path curves';
      undoBtn.style.display = manualPath.length > 0 ? 'block' : 'none';
    });

    undoBtn?.addEventListener('click', () => {
      if (manualPath.length > 0) {
        manualPath.pop();
        const m = pathDotMarkers.pop();
        if (m && addMap) addMap.removeLayer(m);
        updatePathLinePreview();
        undoBtn.style.display = manualPath.length > 0 ? 'block' : 'none';
      }
    });

    // Init map
    const mapEl = screen.querySelector('#add-route-map');
    if (mapEl && typeof L !== 'undefined') {
      addMap = L.map(mapEl, {
        zoomControl: false, attributionControl: false
      }).setView([23.0339, 72.5562], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(addMap);

      // Tap map
      addMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        if (drawingMode === 'stops') {
          const stopNum = stops.length + 1;
          const name = `Stop ${stopNum}`;
          stops.push({ name, lat, lng, passengers: 0, distance_label: '0 m' });

          const marker = L.circleMarker([lat, lng], {
            radius: 8, fillColor: '#22A147', fillOpacity: 1, color: '#fff', weight: 2
          }).addTo(addMap);
          marker.bindTooltip(`${stopNum}`, { permanent: true, direction: 'center', className: 'stop-tooltip' });
          stopMarkers.push(marker);

          updatePathLinePreview();
          renderStopsList();
          updateSaveBtn();
        } else {
          // Draw Path mode
          manualPath.push([lat, lng]);
          const dot = L.circleMarker([lat, lng], {
            radius: 3, fillColor: '#4285F4', fillOpacity: 1, color: 'transparent'
          }).addTo(addMap);
          pathDotMarkers.push(dot);
          
          updatePathLinePreview();
          if (undoBtn) undoBtn.style.display = 'block';
        }
      });

      // Fix map size after render
      setTimeout(() => addMap.invalidateSize(), 200);
    }

    // Save route
    screen.querySelector('#btn-save-route')?.addEventListener('click', async () => {
      const name = screen.querySelector('#route-name')?.value?.trim();
      const fare = parseInt(screen.querySelector('#route-fare')?.value) || 10;
      const duration = screen.querySelector('#route-duration')?.value?.trim() || '10 min';

      if (!name) { showToast('Please enter a route name'); return; }
      if (stops.length < 2) { showToast('Add at least 2 stops'); return; }

      const btn = screen.querySelector('#btn-save-route');
      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        // Auto-name stops based on route name if still default
        const stopsData = stops.map((s, i) => ({
          ...s,
          name: s.name.startsWith('Stop ') ? 
            (i === 0 ? name.split(' to ')[0] || s.name : 
             i === stops.length - 1 ? name.split(' to ')[1] || s.name : s.name)
            : s.name,
          distance_label: `${(i * (fare / stops.length)).toFixed(1)} km`
        }));

        btn.textContent = 'Routing...';
        // Use manually drawn path if the user explicitly traced one, otherwise query OSRM auto-route
        const path = (manualPath.length > 1) ? manualPath : await fetchRouteGeometry(stops);
        const distance = calculateDistance(stops);

        btn.textContent = 'Saving...';
        await api.createRoute({
          name, fare, distance, duration,
          color: getRandomColor(),
          stops: stopsData, path
        });

        showToast('Route created successfully! 🎉');
        setTimeout(() => router.navigate('map'), 500);
      } catch (err) {
        showToast('Failed to save route: ' + err.message);
        btn.textContent = 'Save Route';
        btn.disabled = false;
      }
    });
  }, 0);

  function updatePathLinePreview() {
    if (pathLine && addMap) addMap.removeLayer(pathLine);
    
    // Draw solid line for manual path, or dashed line preview between stops
    if (manualPath.length > 1) {
      pathLine = L.polyline(manualPath, {
        color: '#4285F4', weight: 4, opacity: 0.9
      }).addTo(addMap);
    } else if (stops.length > 1) {
      const pts = stops.map(s => [s.lat, s.lng]);
      pathLine = L.polyline(pts, {
        color: '#text-muted', weight: 3, opacity: 0.5, dashArray: '8 4'
      }).addTo(addMap);
    }
  }

  function renderStopsList() {
    const list = screen.querySelector('#stops-list-form');
    const countEl = screen.querySelector('#stop-count');
    if (!list) return;
    if (countEl) countEl.textContent = stops.length;

    if (stops.length === 0) {
      list.innerHTML = '<div style="font-size:0.85rem;color:var(--text-muted);text-align:center;padding:12px;">No stops added yet. Tap the map above.</div>';
      return;
    }

    list.innerHTML = stops.map((stop, i) => `
      <div class="stop-form-item" data-index="${i}">
        <div class="stop-num">${i + 1}</div>
        <input class="form-input stop-name-input" value="${stop.name}" 
               style="padding:8px 10px;font-size:0.85rem;flex:1;" 
               data-index="${i}" placeholder="Stop name" />
        <div class="stop-form-coords">${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</div>
        <div class="stop-form-remove" data-remove="${i}">✕</div>
      </div>
    `).join('');

    // Name editing
    list.querySelectorAll('.stop-name-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        stops[idx].name = e.target.value;
      });
    });

    // Remove
    list.querySelectorAll('.stop-form-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.remove);
        stops.splice(idx, 1);
        if (stopMarkers[idx] && addMap) addMap.removeLayer(stopMarkers[idx]);
        stopMarkers.splice(idx, 1);
        updatePathLinePreview();
        renderStopsList();
        updateSaveBtn();
      });
    });
  }

  function updateSaveBtn() {
    const btn = screen.querySelector('#btn-save-route');
    if (btn) btn.disabled = stops.length < 2;
  }

  return screen;
}

function calculateDistance(stops) {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    const R = 6371;
    const dLat = (stops[i].lat - stops[i-1].lat) * Math.PI / 180;
    const dLng = (stops[i].lng - stops[i-1].lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(stops[i-1].lat*Math.PI/180) * 
              Math.cos(stops[i].lat*Math.PI/180) * Math.sin(dLng/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.round(total * 10) / 10;
}

// Fetch detailed road geometry matching stops from OSRM
async function fetchRouteGeometry(stops) {
  if (stops.length < 2) return stops.map(s => [s.lat, s.lng]);
  try {
    const coordsStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
    if (!res.ok) throw new Error('OSRM request failed');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lng,lat] to [lat,lng]
    }
    return stops.map(s => [s.lat, s.lng]);
  } catch (err) {
    console.error('Routing failed, falling back to straight lines:', err);
    return stops.map(s => [s.lat, s.lng]);
  }
}

function getRandomColor() {
  const colors = ['#4285F4','#EA4335','#34A853','#FBBC04','#9C27B0','#FF5722','#00BCD4','#E91E63'];
  return colors[Math.floor(Math.random() * colors.length)];
}
