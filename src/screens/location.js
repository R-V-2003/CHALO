// Location Permission Screen — MANDATORY before using the app

import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { locationService } from '../services/location.js';
import { navigateAfterLocation } from './splash.js';
import { showToast } from '../utils/toast.js';

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
      <p>CHALO needs your live location to find shuttles and routes near you.</p>
      <button class="btn-primary" id="btn-use-location">Use my location</button>
      <div id="location-error" style="display:none; color:#EA4335; font-size:0.85rem; font-weight:600; text-align:center; margin-top:12px; line-height:1.5;"></div>
      <button class="btn-text" id="btn-retry-location" style="display:none; margin-top:8px; color:var(--green-dark); font-weight:700;">Try Again</button>
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
    const btnRetry = screen.querySelector('#btn-retry-location');
    const errorEl = screen.querySelector('#location-error');

    async function requestLocation() {
      btnUse.textContent = 'Locating...';
      btnUse.style.opacity = '0.7';
      btnUse.disabled = true;
      errorEl.style.display = 'none';
      btnRetry.style.display = 'none';

      try {
        const result = await locationService.requestPermission();

        if (locationService.hasPermission) {
          // Location granted — proceed 
          showToast('📍 Location enabled!');
          btnUse.textContent = '✓ Location found!';
          btnUse.style.background = '#34A853';
          btnUse.style.color = 'white';

          setTimeout(() => {
            navigateAfterLocation();
          }, 600);
        } else {
          // Permission denied — show error, don't proceed
          btnUse.textContent = 'Use my location';
          btnUse.style.opacity = '1';
          btnUse.disabled = false;
          errorEl.textContent = '⚠️ Location access was denied. CHALO requires your location to work. Please allow location access and try again.';
          errorEl.style.display = 'block';
          btnRetry.style.display = 'inline-block';
        }
      } catch (err) {
        btnUse.textContent = 'Use my location';
        btnUse.style.opacity = '1';
        btnUse.disabled = false;
        errorEl.textContent = '⚠️ Could not get your location. Please check your device settings and try again.';
        errorEl.style.display = 'block';
        btnRetry.style.display = 'inline-block';
      }
    }

    if (btnUse) {
      btnUse.addEventListener('click', requestLocation);
    }

    if (btnRetry) {
      btnRetry.addEventListener('click', requestLocation);
    }
  }, 0);

  return screen;
}
