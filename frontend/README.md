# ShareBloom frontend

The existing React interface uses Vite for development/builds and Vitest with React Testing Library for tests. Retired React Scripts tooling was removed to remediate its dependency findings. The React screens, Bootstrap design and API contracts remain intact.

From this directory:

```bash
npm ci
npm start
npm test
npm run build
```

Development listens on loopback port 3000. The production output is `build/`, matching the prepared Nginx Docker image. This is a client-only SPA; React Router's package-level `use client` directive notices do not indicate server-rendered code in this application.

The default API origin uses the current browser hostname on port 5000. `REACT_APP_API_URL` is a supported public build-time setting for compatibility; an explicitly empty value uses the current origin. Never put credentials in frontend variables. Use consistent hostnames locally and same-site HTTPS API/frontend origins for cookie sessions.

The Vite configuration handles existing JSX-in-.js source files without renaming the component tree. Tests retain the existing assertions under Vitest. See the repository [README](../README.md), [security design](../docs/SECURITY.md) and [testing instructions](../docs/TESTING.md).
