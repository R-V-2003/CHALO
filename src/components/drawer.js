// Side Drawer — Frame 2 exact + Add Route
import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { storage } from '../utils/storage.js';

let drawerEl = null;
let overlayEl = null;

function getAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="#EA4335"/>
      <text x="32" y="38" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="700" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `)}`;
}

export function createDrawer() {
  overlayEl = document.createElement('div');
  overlayEl.className = 'drawer-overlay';
  overlayEl.id = 'drawer-overlay';

  drawerEl = document.createElement('div');
  drawerEl.className = 'drawer';
  drawerEl.id = 'drawer';

  const user = storage.get('user') || { name: 'Guest User', phone: 'Login to set profile' };
  const avatarHtml = user.profile_photo 
    ? `<img src="${user.profile_photo}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<img src="${getAvatar(user.name)}" alt="Avatar" style="width:100%;height:100%;" />`;

  drawerEl.innerHTML = `
    <div class="drawer-profile">
      <div class="drawer-avatar">
        ${avatarHtml}
      </div>
      <div class="drawer-user-info">
        <div class="drawer-name">${user.name}</div>
        <div class="drawer-email">${user.phone}</div>
      </div>
    </div>
    <div class="drawer-divider"></div>
    <nav class="drawer-menu">
      <div class="drawer-menu-item" data-page="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </div>
      <div class="drawer-menu-item" data-page="set-route">${icons.route}<span>Set Route</span></div>
      <div class="drawer-menu-item" data-page="add-route">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Add Route</span>
      </div>
      <div class="drawer-menu-item" data-page="settings">${icons.settings}<span>Settings</span></div>
      <div class="drawer-menu-item" data-page="support">${icons.support}<span>Support</span></div>
      <div class="drawer-menu-item" data-page="faqs">${icons.faq}<span>FAQs</span></div>
    </nav>
    <div class="drawer-footer">
      <div class="drawer-footer-item">
        <div>
          <div class="drawer-footer-label">Region</div>
          <div class="drawer-footer-value">Ahmedabad, India</div>
        </div>
        <div class="drawer-footer-arrow">${icons.chevronRight}</div>
      </div>
      <div class="drawer-footer-item">
        <div>
          <div class="drawer-footer-label">Currency</div>
          <div class="drawer-footer-value">₹ (Rupees)</div>
        </div>
        <div class="drawer-footer-arrow">${icons.chevronRight}</div>
      </div>
    </div>
  `;

  overlayEl.addEventListener('click', closeDrawer);

  drawerEl.querySelectorAll('.drawer-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      closeDrawer();
      setTimeout(() => router.navigate(page), 300);
    });
  });

  return { overlay: overlayEl, drawer: drawerEl };
}

export function openDrawer() {
  if (overlayEl) overlayEl.classList.add('open');
  if (drawerEl) drawerEl.classList.add('open');
}

export function closeDrawer() {
  if (overlayEl) overlayEl.classList.remove('open');
  if (drawerEl) drawerEl.classList.remove('open');
}
