# Chalo: Modern Ride-Hailing Platform

Chalo is a full-stack ride-hailing and shuttle management application built with a focus on real-time visualization and smooth user experience. It allows passengers to find routes, track shuttles, and view fares, while providing a platform for drivers (shuttles) to manage their routes.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (via Vite)
- **Styling**: Vanilla CSS with a focus on premium aesthetics and responsiveness.
- **Maps**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview) for route visualization and shuttle animations.
- **State Management**: React Hooks and Context API.
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized production builds.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [SQLite](https://www.sqlite.org/index.html) (using `better-sqlite3`) for lightweight, high-performance data storage.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
- **API**: RESTful architecture.

### Dev & Ops
- **Containerization**: [Docker](https://www.docker.com/) (Multi-stage build for frontend and backend).
- **Orchestration**: [Docker Compose](https://docs.docker.com/compose/) for local development.

---

## 🚀 How it is Hosted

The application follows a modern CI/CD patterns for deployment on **Amazon Web Services (AWS)**.

### 1. Cloud Infrastructure
- **Hosting Platform**: [Amazon ECS (Elastic Container Service)](https://aws.amazon.com/ecs/) - Runs the containerized application.
- **Container Registry**: [Amazon ECR (Elastic Container Registry)](https://aws.amazon.com/ecr/) - Stores Docker images.
- **Region**: `ap-south-1` (Mumbai).

### 2. CI/CD Pipeline (GitHub Actions)
The deployment is fully automated via GitHub Actions (`.github/workflows/aws-deploy.yml`):
1. **Push to `main`**: Any changes pushed to the main branch trigger the workflow.
2. **Build**: The workflow builds a new Docker image containing both the Vite-built frontend and the Express backend.
3. **Push to ECR**: The image is tagged with the commit SHA and pushed to the private AWS ECR repository.
4. **Deploy to ECS**: The ECS Task Definition is updated with the new image ID, and the ECS Service performs a rolling update to the new version without downtime.

---

## ⚙️ How it Works

### 1. Data Model
The system uses a relational SQLite database with the following core entities:
- **Users**: Passenger and Shuttle roles with authenticated access.
- **Routes**: Defined paths between locations with calculated distance, fare, and color coding.
- **Stops**: Pickup and drop-off points along a route.
- **Path Points**: High-resolution, road-aligned coordinates that allow for realistic, smooth shuttle animations on the map.
- **Drivers**: Assigned to specific vehicles and routes with rating systems.

### 2. Real-time Route Animation
Unlike simple point-to-point lines, Chalo uses **True Road-Aligned Pathfinding**.
- The database stores hundreds of intermediate coordinates for each route.
- The frontend interpolates these coordinates to animate the shuttle icon smoothly along the actual curves of the Ahmedabad city roads.

### 3. Production Serving
In development, the frontend and backend run separately. In production:
1. `npm run build` generates a minified `dist/` folder.
2. The Express server (`server/index.js`) is configured to serve these static files.
3. A single Node.js process handles both API requests and frontend delivery, simplifying the container architecture.

### 4. Health Monitoring
The backend includes a `/api/health` endpoint used by the AWS Load Balancer to monitor container status and ensure high availability.

---

## 📁 Project Structure

```text
Chalo/
├── .github/workflows/    # CI/CD (AWS ECS Deployment)
├── data/                 # SQLite database storage
├── public/               # Static assets
├── server/               # Express backend & SQLite logic
│   ├── routes/           # API endpoints (Auth, Routes, Drivers)
│   └── db.js             # Schema & Seed data
├── src/                  # React frontend source
│   ├── components/       # Reusable UI elements
│   ├── screens/          # Main page views
│   └── main.js           # Entry point
├── Dockerfile            # Container definition
├── task-definition.json  # AWS ECS configuration
└── vite.config.js        # Vite build settings
```

---

## 📱 Mobile (APK) Integration Guide

To convert this web project into a perfectly working Android APK (e.g., using Capacitor or Cordova), follow these critical integration steps:

### 1. Backend Connectivity (Base URL)
In a mobile app, the frontend is not served from the same origin as the backend.
- **Problem**: `const BASE = ''` in `src/api.js` will fail on a mobile device.
- **Solution**: The `BASE` variable must be set to the **Absolute URL** of your hosted AWS ECS service (e.g., `https://api.chalo-app.com`).
- **Development Tip**: Use environment variables (`VITE_API_BASE_URL`) to switch between `localhost:5000` (for testing on an emulator) and the production URL.

### 2. CORS (Cross-Origin Resource Sharing)
The backend must be configured to allow requests from the mobile app's internal origin.
- **Capacitor Origin**: `http://localhost` or `capacitor://localhost`.
- **Backend Change**: Ensure `server/index.js` allows these origins in the `cors()` middleware.

### 3. Network Security (Android Manifest)
Android restricts non-HTTPS (cleartext) traffic by default.
- **Production**: You **MUST** use an SSL certificate (HTTPS) on your AWS Load Balancer.
- **Development**: If testing over HTTP, you must add `android:usesCleartextTraffic="true"` to your `AndroidManifest.xml` file.

### 4. Authentication Persistence
The project currently uses `localStorage` for JWT tokens.
- **Compatibility**: Capacitor and modern WebViews support `localStorage` and it will persist correctly across app restarts.
- **Security**: For production-grade security, it is recommended to use the **Capacitor Secure Storage** plugin for the `auth_token`.

### 5. Google Maps API Key
The Google Maps API key used in `index.html` must have **Android Restrictions** added in the Google Cloud Console.
- You must provide the **Package Name** (e.g., `com.chalo.app`) and the **SHA-1 certificate fingerprint** of your APK to prevent unauthorized usage of your API quota.
