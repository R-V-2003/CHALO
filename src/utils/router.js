// Simple hash-based SPA router

class Router {
  constructor() {
    this.routes = {};
    this.currentScreen = null;
    this.history = [];
  }

  register(name, renderFn) {
    this.routes[name] = renderFn;
  }

  navigate(name, params = {}) {
    if (this.currentScreen === name) return;

    const app = document.getElementById('app');
    const renderFn = this.routes[name];
    if (!renderFn) return;

    const newEl = renderFn(params);
    if (!newEl) return;
    
    newEl.dataset.view = name;
    const isOverlay = newEl.classList.contains('overlay-screen');

    // If opening a full screen, clear out everything
    if (!isOverlay) {
      const allScreens = app.querySelectorAll('.screen');
      allScreens.forEach(el => {
        el.classList.add('exit');
        el.classList.remove('active');
        setTimeout(() => el.remove(), 400);
      });
    } else {
      // If opening an overlay, only clear out other trailing overlays
      const overlays = app.querySelectorAll('.overlay-screen');
      overlays.forEach(el => {
        el.classList.add('exit');
        el.classList.remove('active');
        setTimeout(() => el.remove(), 400);
      });
    }

    if (this.currentScreen) {
      this.history.push(this.currentScreen);
    }
    this.currentScreen = name;

    app.appendChild(newEl);
    
    // Force reflow for animation
    newEl.offsetHeight;
    requestAnimationFrame(() => {
      newEl.classList.add('active');
    });
  }

  back() {
    const prevName = this.history.pop();
    if (!prevName) return;

    const app = document.getElementById('app');
    const activeEl = app.querySelector(`.screen[data-view="${this.currentScreen}"]`);
    
    if (activeEl) {
      activeEl.classList.add('exit');
      activeEl.classList.remove('active');
      setTimeout(() => activeEl.remove(), 400);
    }
    
    this.currentScreen = prevName;

    // If the previous screen is already safely in the DOM (underneath the closing overlay), we don't need to re-render it
    const prevEl = app.querySelector(`.screen[data-view="${prevName}"]`);
    if (prevEl) {
      return; 
    }

    const renderFn = this.routes[prevName];
    if (renderFn) {
      // Pass empty params on back navigation by default for now
      const el = renderFn({});
      el.dataset.view = prevName;
      app.appendChild(el);
      el.offsetHeight;
      requestAnimationFrame(() => el.classList.add('active'));
    }
  }
}

export const router = new Router();
