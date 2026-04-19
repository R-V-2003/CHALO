// Splash Screen — Always goes to location permission first

import { storage } from '../utils/storage.js';
import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { locationService } from '../services/location.js';

export function createSplashScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen splash-screen';
  screen.id = 'splash-screen';

  screen.innerHTML = `
    <div class="splash-logo-wrapper" id="splash-logo">
      <div class="splash-icon">
        ${icons.autoRickshaw}
      </div>
      <div class="splash-title">CHALO</div>
    </div>
  `;

  // Auto-transition after animation
  setTimeout(() => {
    const logo = screen.querySelector('#splash-logo');
    if (logo) logo.classList.add('pulse');
  }, 800);

  setTimeout(() => {
    // Always go to location screen first if location isn't already granted
    if (locationService.hasPermission) {
      navigateAfterLocation();
    } else {
      router.navigate('location');
    }
  }, 2800);

  return screen;
}

// Shared function: navigate to the right screen after location is obtained
export function navigateAfterLocation() {
  const token = storage.get('auth_token');
  const user = storage.get('user');

  if (token && user) {
    if (user.role === 'shuttle') {
      router.navigate('shuttle-dashboard');
    } else {
      router.navigate('map');
    }
  } else {
    router.navigate('login');
  }
}
