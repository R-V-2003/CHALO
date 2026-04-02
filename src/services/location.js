// Location service - wraps the Geolocation API

// Default location: Ahmedabad center (Gujarat University area)
const DEFAULT_LAT = 23.0339;
const DEFAULT_LNG = 72.5562;

class LocationService {
  constructor() {
    this.lat = DEFAULT_LAT;
    this.lng = DEFAULT_LNG;
    this.watchId = null;
    this.listeners = [];
    this.hasPermission = false;
  }

  async requestPermission() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: this.lat, lng: this.lng });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;
          this.hasPermission = true;
          this.startWatching();
          resolve({ lat: this.lat, lng: this.lng });
        },
        () => {
          // Permission denied or error — use default
          resolve({ lat: this.lat, lng: this.lng });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  startWatching() {
    if (this.watchId || !navigator.geolocation) return;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        this.listeners.forEach(fn => fn({ lat: this.lat, lng: this.lng }));
      },
      null,
      { enableHighAccuracy: true }
    );
  }

  stopWatching() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  onUpdate(fn) {
    this.listeners.push(fn);
  }

  getPosition() {
    return { lat: this.lat, lng: this.lng };
  }

  getDefault() {
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  }
}

export const locationService = new LocationService();
