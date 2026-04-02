// Location Permission Screen

import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { locationService } from '../services/location.js';

export function createLocationScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen location-screen';
  screen.id = 'location-screen';

  screen.innerHTML = `
    <div class="location-map-bg">
      <div id="location-bg-map" style="width:100%;height:100%;"></div>
    </div>
    <div class="location-card">
      <div class="location-pin-icon">
        ${icons.locationPinFilled}
      </div>
      <h2>Enable your location</h2>
      <p>Choose your location to start find the request around you</p>
      <button class="btn-primary" id="btn-use-location">Use my location</button>
      <button class="btn-text" id="btn-skip-location">Skip for now</button>
    </div>
  `;

  // Initialize background map after render
  setTimeout(() => {
    const mapEl = screen.querySelector('#location-bg-map');
    if (mapEl && typeof L !== 'undefined') {
      const bgMap = L.map(mapEl, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([23.0339, 72.5562], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(bgMap);
    }
  }, 100);

  // Event handlers
  setTimeout(() => {
    const btnUse = screen.querySelector('#btn-use-location');
    const btnSkip = screen.querySelector('#btn-skip-location');

    if (btnUse) {
      btnUse.addEventListener('click', async () => {
        btnUse.textContent = 'Locating...';
        btnUse.style.opacity = '0.7';
        await locationService.requestPermission();
        router.navigate('map');
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        router.navigate('map');
      });
    }
  }, 0);

  return screen;
}
