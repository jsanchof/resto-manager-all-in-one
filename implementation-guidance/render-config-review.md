# Render Config Review (Free Tier)

## 1. How Render Builds and Serves a Web Application (Free Tier)

- **Render Free Tier** allows you to deploy web services (backend APIs) and static sites (frontend) as separate services.
- **Web Service:** Runs a backend process (e.g., Flask, Node.js) and exposes HTTP endpoints.
- **Static Site:** Serves static files (HTML, JS, CSS) from a build directory (e.g., `dist/`, `build/`, or `public/`).
- **Build Command:** Render runs the specified build command (e.g., `npm run build`, `pip install -r requirements.txt`) to prepare your app.
- **Start Command:** For web services, Render runs the specified start command (e.g., `gunicorn wsgi --chdir ./src/`). For static sites, it serves the output directory.
- **Free Tier Limitation:** You cannot run multiple processes (frontend + backend) in a single service. You must deploy them as separate services (one for API, one for frontend).

## 2. Current Application Configuration

- **Backend:**
  - Flask app in `src/app.py` with WSGI entry in `src/wsgi.py`.
  - Start command: `gunicorn wsgi --chdir ./src/`
  - Exposes API endpoints (e.g., `/api/...`, `/admin/...`).
- **Frontend:**
  - Vite/React app in `src/front/`.
  - Build output (likely `dist/` or `public/` after `npm run build`).
  - No separate static site service currently configured on Render.
- **Result:**
  - The main Render URL (e.g., https://sample-service-name-0664.onrender.com/) points to the backend, not the frontend.

## 3. What Needs to Change for Proper Render Deployment

### a. **Separate Services for Frontend and Backend**
- **Backend:**
  - Keep as a web service (Flask, gunicorn, etc.).
  - Expose only API endpoints (e.g., `/api/`, `/admin/`).
- **Frontend:**
  - Deploy as a separate static site service on Render.
  - Set the build command to `npm run build` and the publish directory to `src/front/dist` (or wherever Vite outputs the build).
  - The static site URL will serve your React app as the main site.
  - Configure the frontend to call the backend API using the backend's Render URL (set as an environment variable, e.g., `VITE_API_URL`).

### b. **CI/CD Pipeline**
- Continue to run tests and builds for both frontend and backend.
- Optionally, automate deployment to both Render services (static and web service) if using GitHub Actions or similar.

### c. **Routing**
- The frontend static site should handle all client-side routes (React Router, etc.).
- The backend should only serve API endpoints and not serve the frontend build.

## 4. Implementation Plan

1. **Create a new Static Site service on Render:**
   - Connect to your repo.
   - Set build command: `npm run build` (in `src/front` directory).
   - Set publish directory: `src/front/dist`.
2. **Update Frontend API URL:**
   - In `.env` or `.env.production` in `src/front`, set `VITE_API_URL` to the backend Render URL.
   - Update API calls in frontend to use this variable.
3. **Keep Backend as Web Service:**
   - No changes needed if already working.
4. **Update Documentation:**
   - Document the two-service setup in your README and implementation guidance.
5. **CI/CD:**
   - Ensure pipeline builds and tests both frontend and backend.
   - Optionally, add deployment steps for both services.

---

**Summary:**
- Render Free Tier requires separate services for frontend (static site) and backend (web service).
- The main site URL should be the static site (frontend), with the backend API called via its own URL.
- Update your configuration and documentation to reflect this for a smooth developer and user experience. 