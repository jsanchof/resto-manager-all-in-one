# Multi-Environment Implementation Plan

This document outlines a structured, iterative checklist for supporting multiple environments (development, production) in your project. The goal is to ensure:
- `FLASK_ENV=production` is used on Render and in CI/CD builds/tests.
- `FLASK_ENV=development` is used for local development.
- The CI/CD pipeline tests the production build in a development environment to ensure reliability.

---

## Phase 1: Environment Variable Management
- [ ] Review all places where `FLASK_ENV` is set or used (code, scripts, configs, Render, CI/CD).
- [ ] Ensure `.env` and `.env.example` files are present and documented for local development.
- [ ] Add `.env.production` (if needed) for production-specific variables.
- [ ] Add `.env.test` (if needed) for test-specific variables.

## Phase 2: Codebase Adaptation
- [ ] Refactor code to use `os.getenv('FLASK_ENV', 'development')` as the default.
- [ ] Ensure all environment-specific logic (e.g., debug, DB URLs, static file serving) is controlled by `FLASK_ENV`.
- [ ] Document all environment-specific behaviors in the README or implementation guidance.

## Phase 3: Render Configuration
- [ ] Set `FLASK_ENV=production` in Render's environment variables (in `render.yaml` or Render dashboard).
- [ ] Ensure other production variables (e.g., `DATABASE_URL`, secrets) are set in Render.
- [ ] Confirm that the build and start commands do not override `FLASK_ENV`.

## Phase 4: CI/CD Pipeline Updates
- [ ] Update the workflow to explicitly set `FLASK_ENV=production` for build, migration, and test steps.
- [ ] Ensure the pipeline uses the production build output for tests.
- [ ] Add a step to print the value of `FLASK_ENV` during CI/CD for verification.
- [ ] Document the CI/CD environment strategy in the implementation guidance.

## Phase 5: Local Development
- [ ] Ensure `.env` (or local config) sets `FLASK_ENV=development` by default.
- [ ] Document how to override `FLASK_ENV` locally for testing production builds.
- [ ] Add a script or Makefile target to run the app in production mode locally for testing.

## Phase 6: Testing and Verification
- [ ] Test local development with `FLASK_ENV=development`.
- [ ] Test local production build with `FLASK_ENV=production`.
- [ ] Test CI/CD pipeline to ensure it builds, migrates, and tests with `FLASK_ENV=production`.
- [ ] Deploy to Render and verify the app runs with `FLASK_ENV=production`.
- [ ] Document any issues and solutions in this file for future reference.

## New Phase: Registration 500 Internal Server Error
- **Error:** POST /api/auth/register returns 500 INTERNAL SERVER ERROR.
- **Checklist for Possible Issues:**
  - [ ] User already exists (should return 409, but check backend logic)
  - [ ] Database error (connection, schema, constraints)
  - [ ] Missing or invalid fields in request
  - [ ] Exception in backend registration logic (check logs for details)
- **Root Cause Investigation Steps:**
  1. Check backend logs for the full stack trace and error message when 500 occurs.
  2. Confirm the request payload matches backend expectations (all required fields, correct types).
  3. Test registration with a new, unique email to rule out duplicate user issue.
  4. Check database connectivity and schema (e.g., migrations applied, constraints).
- **How to Solve:**
  - Fix any backend logic errors or missing error handling.
  - Ensure proper error messages and status codes are returned for known issues (e.g., 409 for duplicate user, 400 for bad request).
  - Add more detailed error logging if needed.
- **Next step:** Investigate backend logs and registration logic, then apply the fix. If further errors occur, add them as the next phase.

---

## Iteration Process
- Complete each phase step-by-step.
- After each phase, test and verify the environment behavior.
- Update this checklist and documentation as you go.
- Repeat phases as needed until all environments work as expected and are fully tested.

---

**Goal:**
- Seamless multi-environment support for local, CI/CD, and production (Render) deployments.
- Confidence that the production build is always tested and works in all environments.

---

## Actions Taken So Far
- Reviewed and documented all uses of FLASK_ENV in code, configs, and CI/CD.
- Updated README with environment variable usage and multi-env support.
- Set FLASK_ENV=production in Render and CI/CD pipeline.
- Ensured code uses os.getenv('FLASK_ENV', 'development') as default.
- Documented .env, .env.example, .env.production usage.
- Updated pytest.ini for local test clarity.
- Provided local and production testing steps.

---

## Current Error (Local Production Test)

When running:
```
$env:FLASK_ENV = 'production'
python .\src\app.py
```
Error:
```
Traceback (most recent call last):
  File "C:\Users\pablo\Codigo\resto-manager-all-in-one\src\app.py", line 9, in <module>
    from src.api.utils import APIException, generate_sitemap
ModuleNotFoundError: No module named 'src.api.utils'
```

### Analysis
- This error occurs because when running `python src/app.py` directly, Python does not include the `src` directory in `sys.path` by default, so `from src.api.utils` fails.
- This is a common issue when using absolute imports in a subdirectory.

### Possible Solutions
1. **Run the app as a module from the project root:**
   ```
   python -m src.app
   ```
   This will set up the import paths correctly.
2. **Adjust PYTHONPATH:**
   - Temporarily set the PYTHONPATH to include the project root:
     ```
     $env:PYTHONPATH = '.'
     python src/app.py
     ```
3. **(Not recommended) Change imports to be relative or local-only.**
   - This would break other environments and is not recommended for a multi-env setup.

### Next Steps
- Try running the app with `python -m src.app` from the project root.
- If needed, set `PYTHONPATH` as shown above.
- Document which solution works best for local production testing.
- If further errors occur, add them as the next phase to iterate.

---

## Resolution: Import Error
- Running the app as a module (`python -m src.app`) from the project root solved the import error.
- Local production testing can proceed using this method.

---

## Next Phase: Registration Endpoint 405 Error

### Current Issue
- When attempting to register a user from the frontend, the following errors occur:
  - Frontend: `Error: Could not fetch the message from the backend. Please check if the backend is running and the backend port is public.`
  - Frontend: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` (backend returned HTML, not JSON)
  - Frontend: `Failed to load resource: the server responded with a status of 405 (METHOD NOT ALLOWED)`
  - Backend: `POST /register HTTP/1.1" 405 -`

### Analysis
- The backend does not have a route for `POST /register`, or the route does not allow POST.
- The frontend may be calling the wrong endpoint or using the wrong method.

### Troubleshooting Steps
1. **Check Backend Route:**
   - Locate the registration route in the Flask app.
   - Ensure it is defined as `@app.route('/register', methods=['POST'])` or similar, and that it allows POST.
   - If the route is under a different path (e.g., `/api/auth/register`), note the correct path.
2. **Check Frontend API Call:**
   - Confirm the frontend is calling the correct endpoint for registration.
   - Ensure `VITE_BACKEND_URL` is set and used correctly.
3. **Test the Endpoint Directly:**
   - Use Postman or `curl` to POST to the registration endpoint and verify the response.
4. **Update Documentation:**
   - Document the correct endpoint and method in the implementation guidance and README.

### Next Steps
- Investigate and fix the registration endpoint issue.
- Document the solution and continue to the next phase if further errors occur.

---

## Resolution: Registration Endpoint 405 Error
- **Root cause:** The frontend was POSTing to `/register` instead of `/api/auth/register`. The backend only defines the registration route at `/api/auth/register`.
- **Solution:** Update the frontend registration API call to use `${VITE_BACKEND_URL}/api/auth/register`.
- **Next step:** Test registration from the frontend after updating the endpoint. You should receive a JSON response from the backend. If further errors occur, add them as the next phase.

---

## Code Correction: Registration Endpoint
- Updated the frontend registration API calls in both `RegisterPage.jsx` and `AdminUsers.jsx` to use the correct backend endpoint: `${VITE_BACKEND_URL}/api/auth/register`.
- This should resolve the 405 error and allow user registration to work as expected.
- **Next step:** Test registration from the frontend. If further errors occur, add them as the next phase.

---

## Checklist Update: Environment Variables
- [ ] Ensure `FRONTEND_URL` is set in all environments (local, CI/CD, Render) for registration and email verification to work.
- [x] All major frontend API calls were reviewed. Most use the correct `${VITE_BACKEND_URL}` prefix.
- [ ] Some admin dashboard endpoints use relative paths (e.g., `/api/admin/analytics/sales`) and should be updated to use `${VITE_BACKEND_URL}` for consistency and to avoid issues in production builds.
- [ ] We are still in Phase 6: testing the production build locally. Actions completed so far are marked above.
- [ ] Next: Update any remaining endpoints in the frontend to use the correct backend URL, then continue testing. 