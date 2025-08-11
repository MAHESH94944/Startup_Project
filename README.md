# Warner & Spencer – E‑Commerce API

Live Backend: https://warner-and-spencer-shoes.onrender.com

Status: ✅ Production (Render)

---

## 1. Overview

Node.js + Express + MongoDB + Passport (Google OAuth) + JWT (httpOnly cookie) + ImageKit uploads.

Auth flow: On login / register / Google callback we issue a 7‑day JWT and set it in a persistent httpOnly cookie `token` (and also return the token in JSON as a fallback). In production the cookie is: `SameSite=None; Secure`. In development: `SameSite=Lax; Secure=false`.

All stateful frontend calls MUST include credentials so the cookie is sent.

---

## 2. Environment Variables (.env)

Required (example values already present):

PORT=5000
NODE_ENV=production|development
FRONTEND_URL=https://warnershoes.onrender.com
ADMIN_FRONTEND_URL=https://warnershoesadmin.onrender.com
MONGODB_URL=your-mongodb-uri
JWT_SECRET=long-random-string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SUCCESS_REDIRECT=https://warnershoes.onrender.com/
IMAGE_KIT_PUBLIC_KEY=...
IMAGE_KIT_PRIVATE_KEY=...
IMAGE_KIT_URL_ENDPOINT=...

Notes:

- Set NODE_ENV=production on Render so cookies become Secure + SameSite=None.
- FRONTEND_URL / ADMIN_FRONTEND_URL must exactly match origins (protocol + domain + optional port).

---

## 3. Architecture

src/app.js – Express app, CORS allowlist, trust proxy, routes.
src/config/passport.js – Google OAuth strategy.
src/config/db.js – Mongo connection.
src/controllers – auth, user, product logic.
src/middleware – auth (JWT), adminCheck, multer (memory storage).
src/models – Mongoose schemas (User, Product).
src/services/storage.service.js – ImageKit upload (memory buffer → remote URL).
src/utils/validator.js – Password strength helper.

---

## 4. CORS & Cookies

Allowed origins: FRONTEND_URL, ADMIN_FRONTEND_URL, http://localhost:5173, http://localhost:3000.

Credentials: true (so browser sends cookies).

Cookie options via central helper:

- Max Age: 7 days
- httpOnly: true
- Production: Secure + SameSite=None (cross‑site allowed)
- Dev: Secure false + SameSite=Lax

If the frontend is on a different domain and you forget `credentials: 'include'`, you will appear logged out.

---

## 5. Auth Lifecycle (Frontend Responsibilities)

1. User registers or logs in → backend sets `token` cookie + returns JSON with `token` & `user`.
2. On app load, call GET /api/auth/me (with credentials) to hydrate auth state.
3. Optional: store returned user in global state (Redux/Zustand/etc.). Avoid storing password or raw cookie.
4. For protected routes (profile, admin, product CRUD) always include credentials.
5. Logout → POST /api/auth/logout (credentials) → clear cookie locally (backend clears). Then clear local state.
6. Google OAuth: redirect user to /api/auth/google. After Google → backend callback sets cookie → redirects to FRONTEND_URL. Frontend should then invoke /api/auth/me.

Fallback Token Usage: If a browser blocks third‑party cookies, you may capture `token` from the login/register response and send Authorization: Bearer <token> on each request (backend also checks Authorization header).

---

## 6. Endpoint Reference

Health: GET /health → { status, timestamp }

### Auth

POST /api/auth/register Body: { name, email, password }
POST /api/auth/login Body: { email, password }
GET /api/auth/google (redirect to Google)
GET /api/auth/google/callback (internal – cookie set, redirects)
GET /api/auth/me (requires cookie / bearer)
POST /api/auth/logout

### User

GET /api/user/profile
PATCH /api/user/profile Body (any): { name, email, phone, oldPassword, password }

### Admin Products (require admin role)

POST /api/admin/products (multipart/form-data + images)
GET /api/admin/products
GET /api/admin/products/:id
PUT /api/admin/products/:id (multipart/form-data)
DELETE /api/admin/products/:id

### Public Products (WIP)

Current non-admin product routes scaffolded under /api/product (extend as needed).

---

## 7. Product Upload (Frontend FormData Example)

Example (fetch):

```js
async function createProduct(formValues, files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("img", f)); // up to 5 images
  fd.append("title", formValues.title);
  fd.append("price", String(formValues.price));
  fd.append("discount", String(formValues.discount || 0));
  fd.append("size", JSON.stringify(formValues.size)); // e.g. [8,9,10]
  fd.append("description", formValues.description);
  fd.append("color", JSON.stringify(formValues.color)); // e.g. ["Black","Brown"]
  fd.append("country", formValues.country || "");
  fd.append("deliveryAndReturns", formValues.deliveryAndReturns || "");
  fd.append(
    "productInformation",
    JSON.stringify({ material: formValues.material, care: formValues.care })
  );
  fd.append("stock", String(formValues.stock || 0));

  const res = await fetch(`${API_BASE}/api/admin/products`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}
```

Axios example:

```js
import axios from "axios";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });
// api.post('/api/admin/products', fd)
```

---

## 8. Auth Helpers (Frontend)

Fetch wrapper:

```js
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 401) throw new Error("UNAUTHENTICATED");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

Login:

```js
async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
```

Hydrate session on app start:

```js
async function loadSession() {
  try {
    return await apiFetch("/api/auth/me");
  } catch {
    return null;
  }
}
```

Google Login button:

```js
function loginWithGoogle() {
  window.location.href = `${API_BASE}/api/auth/google`;
}
```

Logout:

```js
async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
```

Bearer fallback (if cookie blocked):

```js
let fallbackToken = null; // set from login/register response
async function bearerFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (fallbackToken) headers.Authorization = `Bearer ${fallbackToken}`;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  return res.json();
}
```

---

## 9. Image Handling

Uploads use in-memory Multer, then ImageKit. The controller expects field name `img` (up to 5). Backend returns stored URLs in `product.img` array.

Edge cases to avoid:

- Missing images → 400
- Invalid JSON strings for size/color/productInformation → 400

---

## 10. Security Notes

JWT secret MUST be long & private.
Never expose IMAGE_KIT_PRIVATE_KEY client-side.
Do not store password hashes client-side (server already returns minimal user object).
Use HTTPS in production (Render provides TLS) – secure cookies rely on it.

---

## 11. Local Development

1. Copy .env and adjust FRONTEND_URL to your local frontend origin (e.g. http://localhost:5173).
2. npm install
3. npm start (default port 5000)
4. Use MongoDB Atlas URI or local Mongo instance.
5. Create an admin manually (in Mongo) or temporarily set role via DB to test admin routes.

---

## 12. Troubleshooting

Cookie missing after login:

- Check devtools → Application → Cookies: is `token` there?
- Origin mismatch? Ensure your frontend origin matches env variable exactly.
- Forgot credentials: 'include' ?
- Browser privacy / third‑party blocking? Try fallback bearer token.

Getting CORS error:

- Confirm your origin is whitelisted (FRONTEND_URL / ADMIN_FRONTEND_URL).
- If using a new local port, add it before redeploying.

Google OAuth popup closes but no session:

- Ensure callback URL matches one registered in Google Cloud console.
- Check server logs for Passport errors.

---

## 13. Future Enhancements (Roadmap)

- Public product browsing endpoints (pagination, filters) under /api/product
- Password reset (email token)
- Rate limiting & helmet hardening
- Audit logs for admin actions
- S3 backup for images (optional alongside ImageKit)

---

## 14. Quick Reference Cheat Sheet

Auth check: GET /api/auth/me (credentials)
Profile: GET /api/user/profile
Update profile: PATCH /api/user/profile
Admin add product: POST /api/admin/products (FormData)
Logout: POST /api/auth/logout

Always include: credentials: 'include'

---

Happy building – reach out if anything is unclear.
