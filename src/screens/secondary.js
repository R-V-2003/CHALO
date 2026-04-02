// Secondary Screens — API-driven where needed
import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { showToast } from '../utils/toast.js';
import { api } from '../api.js';
import { storage } from '../utils/storage.js';

function getAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#4285F4','#EA4335','#34A853','#FBBC04','#9C27B0','#FF5722'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="${bg}"/>
      <text x="32" y="38" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="700" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `)}`;
}

// ============ Profile ============
export function createProfileScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen settings-screen';

  const user = storage.get('user') || { name: 'Guest User', phone: 'N/A' };
  const avatarHtml = user.profile_photo 
    ? `<img src="${user.profile_photo}" alt="Profile" style="width:100%;height:100%;object-fit:cover;" />`
    : getAvatar(user.name);

  screen.innerHTML = `
    <div class="settings-header">
      <button class="settings-back-btn" id="profile-back">${icons.arrowLeft}</button>
      <h2>Profile</h2>
      <button class="settings-action-btn" style="color:var(--white);font-weight:700;font-size:0.9rem;">Edit</button>
    </div>
    <div class="settings-body" style="background:var(--bg);padding:0;">
      <div style="background:var(--gradient-brand);padding:24px 24px 40px;display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--white);border-radius:0 0 32px 32px;box-shadow:var(--shadow-md);">
        <div style="width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,0.5);box-shadow:0 8px 24px rgba(0,0,0,0.15);overflow:hidden;">
          ${avatarHtml}
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.6rem;font-weight:800;font-family:'Outfit',sans-serif;letter-spacing:-0.5px;text-shadow:0 1px 3px rgba(0,0,0,0.1);">${user.name}</div>
          <div style="font-size:0.9rem;font-weight:500;opacity:0.9;margin-top:2px;">${user.phone}</div>
        </div>
      </div>
      
      <div style="padding:24px 16px;display:flex;flex-direction:column;gap:16px;margin-top:-20px;">
        <div class="settings-group" style="background:var(--white);border-radius:var(--r-md);box-shadow:var(--shadow-sm);padding:8px;margin:0;">
          <div class="settings-group-title" style="padding:12px 16px 4px;font-size:0.8rem;">Personal Info</div>
          <div class="settings-item" style="border-bottom:1px solid var(--border);"><span class="settings-item-label">Full Name</span><span class="settings-item-value">${user.name}</span></div>
          <div class="settings-item" style="border-bottom:1px solid var(--border);"><span class="settings-item-label">Phone</span><span class="settings-item-value">${user.phone}</span></div>
          <div class="settings-item" style="border:none;"><span class="settings-item-label">Email</span><span class="settings-item-value">N/A</span></div>
        </div>
        
        <div class="settings-group" style="background:var(--white);border-radius:var(--r-md);box-shadow:var(--shadow-sm);padding:8px;margin:0;">
          <div class="settings-group-title" style="padding:12px 16px 4px;font-size:0.8rem;">Statistics</div>
          <div class="settings-item" style="border-bottom:1px solid var(--border);"><span class="settings-item-label">Total Rides</span><span class="settings-item-value" style="font-weight:700;color:var(--green-dark);">47</span></div>
          <div class="settings-item" style="border-bottom:1px solid var(--border);"><span class="settings-item-label">Money Saved</span><span class="settings-item-value" style="font-weight:700;color:var(--green-dark);">₹1,240</span></div>
          <div class="settings-item" style="border:none;"><span class="settings-item-label">Member Since</span><span class="settings-item-value">Jan 2025</span></div>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    screen.querySelector('#profile-back')?.addEventListener('click', () => router.back());
  }, 0);
  return screen;
}

// ============ Settings ============
export function createSettingsScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen settings-screen';
  screen.innerHTML = `
    <div class="settings-header">
      <button class="settings-back-btn" id="settings-back">${icons.arrowLeft}</button>
      <h2>Settings</h2>
    </div>
    <div class="settings-body">
      <div class="settings-group">
        <div class="settings-group-title">Preferences</div>
        <div class="settings-item" id="s-notif"><span class="settings-item-label">Notifications</span><span class="settings-item-value">Enabled</span></div>
        <div class="settings-item" id="s-lang"><span class="settings-item-label">Language</span><span class="settings-item-value">English</span></div>
        <div class="settings-item"><span class="settings-item-label">Distance Unit</span><span class="settings-item-value">Kilometers</span></div>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">Account</div>
        <div class="settings-item"><span class="settings-item-label">Region</span><span class="settings-item-value">Ahmedabad, India</span></div>
        <div class="settings-item"><span class="settings-item-label">Currency</span><span class="settings-item-value">₹ (INR)</span></div>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">About</div>
        <div class="settings-item"><span class="settings-item-label">Version</span><span class="settings-item-value">2.0.0</span></div>
        <div class="settings-item"><span class="settings-item-label">Privacy Policy</span><span class="settings-item-value">${icons.chevronRight}</span></div>
      </div>
    </div>
  `;
  setTimeout(() => {
    screen.querySelector('#settings-back')?.addEventListener('click', () => router.back());
    screen.querySelector('#s-notif')?.addEventListener('click', () => showToast('Notifications toggled'));
  }, 0);
  return screen;
}

// ============ Support ============
export function createSupportScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen settings-screen';
  screen.innerHTML = `
    <div class="settings-header">
      <button class="settings-back-btn" id="support-back">${icons.arrowLeft}</button>
      <h2>Support</h2>
    </div>
    <div class="settings-body">
      <div style="text-align:center;padding:32px 0;">
        <div style="width:64px;height:64px;margin:0 auto 16px;background:var(--gradient-brand);border-radius:50%;display:flex;align-items:center;justify-content:center;">${icons.support}</div>
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:8px;">Need Help?</h3>
        <p style="font-size:0.85rem;color:var(--text-sec);line-height:1.6;">Our support team is available 24/7.</p>
      </div>
      <div class="settings-group">
        <div class="settings-group-title">Contact Us</div>
        <div class="settings-item" id="s-call"><span class="settings-item-label">📞 Call Support</span><span class="settings-item-value">1800-123-4567</span></div>
        <div class="settings-item" id="s-email"><span class="settings-item-label">📧 Email</span><span class="settings-item-value">support@chalo.app</span></div>
        <div class="settings-item"><span class="settings-item-label">💬 Live Chat</span><span class="settings-item-value">Available</span></div>
      </div>
    </div>
  `;
  setTimeout(() => {
    screen.querySelector('#support-back')?.addEventListener('click', () => router.back());
    screen.querySelector('#s-call')?.addEventListener('click', () => showToast('Calling 1800-123-4567...'));
  }, 0);
  return screen;
}

// ============ FAQs ============
export function createFAQsScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen settings-screen';
  const faqs = [
    { q: 'How do I find a shared auto?', a: 'Open the app, allow location, and see available routes on the map.' },
    { q: 'How is fare calculated?', a: 'Base fare ₹5 + ₹2 per km. Minimum ₹8.' },
    { q: 'Can I request an auto to wait?', a: 'Yes! Open trip details and press "REQUEST TO WAIT".' },
    { q: 'How do I add a new route?', a: 'Go to Menu → Add Route. Tap on the map to place stops, name the route, and save.' },
    { q: 'Is the app free?', a: 'Yes, CHALO is free. You only pay the standard fare.' },
    { q: 'What cities are supported?', a: 'Currently Ahmedabad, Gujarat. More coming soon!' },
  ];
  screen.innerHTML = `
    <div class="settings-header">
      <button class="settings-back-btn" id="faqs-back">${icons.arrowLeft}</button>
      <h2>FAQs</h2>
    </div>
    <div class="settings-body">
      <div class="settings-group">
        <div class="settings-group-title">Frequently Asked Questions</div>
        ${faqs.map((f, i) => `
          <div class="settings-item" style="flex-direction:column;align-items:flex-start;gap:4px;" data-faq="${i}">
            <span class="settings-item-label" style="font-weight:600;">❓ ${f.q}</span>
            <span id="faq-a-${i}" style="display:none;font-size:0.85rem;color:var(--text-sec);line-height:1.5;padding-top:4px;">${f.a}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  setTimeout(() => {
    screen.querySelector('#faqs-back')?.addEventListener('click', () => router.back());
    screen.querySelectorAll('[data-faq]').forEach(el => {
      el.addEventListener('click', () => {
        const a = el.querySelector(`#faq-a-${el.dataset.faq}`);
        if (a) a.style.display = a.style.display === 'none' ? 'block' : 'none';
      });
    });
  }, 0);
  return screen;
}

// ============ Set Route (API-driven) ============
export function createSetRouteScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen settings-screen';
  screen.innerHTML = `
    <div class="settings-header">
      <button class="settings-back-btn" id="setroute-back">${icons.arrowLeft}</button>
      <h2>Set Route</h2>
    </div>
    <div class="settings-body" id="setroute-body">
      <div style="text-align:center;padding:20px;">
        <div class="map-loading-spinner" style="margin:0 auto;"></div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    screen.querySelector('#setroute-back')?.addEventListener('click', () => router.back());
    const body = screen.querySelector('#setroute-body');
    try {
      const routes = await api.getRoutes();
      const savedRoutes = storage.get('favorite_routes', []);

      body.innerHTML = `
        <div class="settings-group">
          <div class="settings-group-title">Available Routes</div>
          <p style="font-size:0.85rem;color:var(--text-sec);margin-bottom:12px;">Tap ☆ to save your preferred routes.</p>
          ${routes.map(r => `
            <div class="settings-item" data-route-id="${r.id}" style="cursor:pointer;">
              <div>
                <span class="settings-item-label">${r.name}</span>
                <div style="font-size:0.7rem;color:var(--text-sec);margin-top:2px;">₹${r.fare} · ${r.distance} km · ${r.duration}</div>
              </div>
              <span class="route-fav" style="font-size:20px;">${savedRoutes.includes(r.id) ? '⭐' : '☆'}</span>
            </div>
          `).join('')}
        </div>
      `;

      body.querySelectorAll('[data-route-id]').forEach(el => {
        el.addEventListener('click', () => {
          const id = parseInt(el.dataset.routeId);
          let saved = storage.get('favorite_routes', []);
          const fav = el.querySelector('.route-fav');
          if (saved.includes(id)) {
            saved = saved.filter(x => x !== id);
            if (fav) fav.textContent = '☆';
            showToast('Route removed');
          } else {
            saved.push(id);
            if (fav) fav.textContent = '⭐';
            showToast('Route saved!');
          }
          storage.set('favorite_routes', saved);
        });
      });
    } catch (err) {
      body.innerHTML = '<div style="text-align:center;padding:20px;color:#EA4335;">Failed to load routes</div>';
    }
  }, 0);
  return screen;
}
