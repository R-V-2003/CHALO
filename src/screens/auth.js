// Authentication Screens (Login / Register)
import { icons } from '../utils/icons.js';
import { router } from '../utils/router.js';
import { api } from '../api.js';
import { storage } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';

export function createAuthScreen(isLogin = true) {
  const screen = document.createElement('div');
  screen.className = 'screen auth-screen';
  screen.id = 'auth-screen';

  screen.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-header">
        <div class="auth-logo">${icons.autoRickshawSmall || '🛺'}</div>
        <h1 class="auth-title">${isLogin ? 'Welcome Back' : 'Join CHALO'}</h1>
        <p class="auth-subtitle">${isLogin ? 'Login to continue your journey' : 'Register to ride or drive with us'}</p>
      </div>
      
      <div class="auth-card">
        <form id="auth-form" class="auth-form">
          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="auth-name" class="form-input" placeholder="e.g. Rahul Kumar" required />
            </div>
          ` : ''}
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="auth-phone" class="form-input" placeholder="e.g. 9876543210" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="auth-password" class="form-input" placeholder="••••••••" required />
          </div>
          ${!isLogin ? `
            <div class="form-group" style="margin-top: 8px;">
              <label class="form-label">I am a...</label>
              <div class="role-selector">
                <label class="role-option">
                  <input type="radio" name="auth-role" value="passenger" checked />
                  <div class="role-card">
                    <div style="height:60px;margin-bottom:8px;">${icons.illustrationPassenger}</div>
                    Passenger
                  </div>
                </label>
                <label class="role-option">
                  <input type="radio" name="auth-role" value="shuttle" />
                  <div class="role-card">
                    <div style="height:60px;margin-bottom:8px;">${icons.illustrationDriver}</div>
                    Shuttle Driver
                  </div>
                </label>
              </div>
            </div>
          ` : ''}
          <button type="submit" class="btn-primary auth-submit">
            ${isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <div class="auth-footer">
          ${isLogin 
            ? `Don't have an account? <span class="auth-link" id="link-register">Register</span>` 
            : `Already have an account? <span class="auth-link" id="link-login">Login</span>`}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Toggles
    screen.querySelector('#link-register')?.addEventListener('click', () => {
      router.navigate('register');
    });
    screen.querySelector('#link-login')?.addEventListener('click', () => {
      router.navigate('login');
    });

    // Submit
    const form = screen.querySelector('#auth-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phone = form.querySelector('#auth-phone').value.trim();
      const password = form.querySelector('#auth-password').value;
      const btn = form.querySelector('.auth-submit');
      
      btn.textContent = 'Please wait...';
      btn.disabled = true;

      try {
        let act;
        if (isLogin) {
          act = await api.login({ phone, password });
        } else {
          const name = form.querySelector('#auth-name').value.trim();
          const role = form.querySelector('input[name="auth-role"]:checked').value;
          act = await api.register({ name, phone, password, role });
        }

        // Save session
        storage.set('auth_token', act.token);
        storage.set('user', act.user);
        
        showToast(isLogin ? 'Logged in successfully!' : 'Account created!');
        
        // Route correctly
        setTimeout(() => {
          if (act.user.role === 'shuttle') {
            router.navigate('shuttle-dashboard');
          } else {
            router.navigate('map');
          }
        }, 500);

      } catch (err) {
        showToast(err.message || 'Authentication failed');
        btn.textContent = isLogin ? 'Login' : 'Create Account';
        btn.disabled = false;
      }
    });
  }, 0);

  return screen;
}
