# Warner & Spencer - Ecommerce API

**Live Backend URL:** `https://warner-and-spencer-shoes.onrender.com`

**Status:** ✅ **LIVE AND WORKING**

---

## Guide for Frontend Developers

This document provides all necessary information to integrate the frontend with our ecommerce backend API.

### Important Concepts

1.  **Cold Starts**: Our backend is hosted on Render's free tier. The first request after a period of inactivity may take **10-30 seconds** to process as the server "wakes up". Please implement loading indicators in the UI to handle this delay. You can use the `/health` endpoint to "warm up" the server.

2.  **Authentication**: We use a secure, cookie-based authentication system. The JWT token is stored in an `httpOnly` cookie. For your frontend requests to work, you **must** include `credentials: 'include'` in your `fetch` or `axios` configuration.

3.  **CORS**: Cross-Origin Resource Sharing is configured to only allow requests from the domain specified in the `FRONTEND_URL` environment variable. For local development, you may need to add your localhost URL (e.g., `http://localhost:3000`) to the allowed origins in `app.js`.

### Performance & Deployment Notes

- **Slow Initial Deployment**: The deployment process may seem slow the first time after adding new dependencies (like `imagekit` and `multer`). This is because the hosting service (Render) needs to download and install all packages from scratch.
- **Faster Subsequent Deployments**: Future deployments will be much faster as Render caches the installed dependencies (`node_modules`). The slowness is typically a one-time event per dependency change.
- **Code Optimization**: The controllers have been optimized to reduce code duplication and improve maintainability. The core logic remains the same.

---

## API Reference

### Health Check

A simple endpoint to verify that the server is running.

- **GET** `/health`
  - **Success Response (200):** `{"status": "OK", "timestamp": "..."}`

---

### Authentication Endpoints

Endpoints for user registration, login, and session management.

#### 1. Register User

- **POST** `/api/auth/register`
- **Description:** Creates a new user account.
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Success (201):** `{ "message": "User registered successfully", "user": {...} }`
- **Error (400):** `{ "message": "Email already exists" }` or validation error.

#### 2. Login User

- **POST** `/api/auth/login`
- **Description:** Authenticates a user and sets the session cookie.
- **Body:** `{ "email": "...", "password": "..." }`
- **Success (200):** `{ "message": "Login successful", "user": {...} }`
- **Error (400):** `{ "message": "Invalid credentials" }`

#### 3. Google OAuth Login

- **GET** `/api/auth/google`
- **Description:** Redirects the user to Google's OAuth screen. After successful authentication, Google redirects back, and the backend returns a JSON response with the user's info and a JWT token.
- **Usage:** Your frontend should have a "Login with Google" button that navigates to this URL.

#### 4. Get Current Authenticated User

- **GET** `/api/auth/me`
- **Description:** Retrieves the currently logged-in user's basic info. Ideal for checking authentication status on app load.
- **Auth:** Required.
- **Success (200):** `{ "user": {...} }`
- **Error (401):** `{ "message": "Not authorized, no token" }`

#### 5. Logout User

- **POST** `/api/auth/logout`
- **Description:** Clears the session cookie, logging the user out.
- **Auth:** Required.
- **Success (200):** `{ "message": "Logged out successfully" }`

---

### User Profile Endpoints

Endpoints for managing the logged-in user's profile.

#### 1. Get User Profile

- **GET** `/api/user/profile`
- **Description:** Retrieves the full profile of the currently logged-in user.
- **Auth:** Required.
- **Success (200):** `{ "user": {...} }`

#### 2. Update User Profile

- **PATCH** `/api/user/profile`
- **Description:** Updates the logged-in user's profile information.
- **Auth:** Required.
- **Body:** `{ "name": "...", "phone": "...", "oldPassword": "...", "password": "..." }` (any combination).
- **Success (200):** `{ "message": "Profile updated successfully", "user": {...} }`
- **Error (400):** For incorrect old password, trying to change password for a social login account, etc.

---

### Admin Product Endpoints

These endpoints are restricted to users with an `admin` role.

#### 1. Add a New Product

- **POST** `/api/admin/products`
- **Description:** Creates a new product. Requires `multipart/form-data` for image uploads.
- **Auth:** Admin Required.
- **Headers:** `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `img`: (File) One or more image files.
  - `title`: (Text) "Premium Leather Shoes"
  - `price`: (Text) `4999`
  - `discount`: (Text) `10`
  - `size`: (Text) `[8,9,10]` **(Must be a valid JSON array string)**
  - `description`: (Text) "Handcrafted premium leather shoes with fine stitching."
  - `color`: (Text) `["Black","Brown"]` **(Must be a valid JSON array string)**
  - `country`: (Text) "India"
  - `deliveryAndReturns`: (Text) "Free delivery and 30-day returns."
  - `productInformation`: (Text) `{"material":"100% Genuine Leather","care":"Wipe with a clean, dry cloth."}` **(Must be a valid JSON object string)**
  - `stock`: (Text) `100`
- **Success (201):** `{ "message": "Product created successfully", "product": {...} }`

#### 2. Get All Products (Admin View)

- **GET** `/api/admin/products`
- **Description:** Retrieves a paginated and filterable list of all products.
- **Auth:** Admin Required.
- **Query Params (optional):** `page`, `limit`, `search`, `color`, `size`.
- **Success (200):** `{ "products": [...], "totalPages": ..., "currentPage": ..., "total": ... }`

#### 3. Get Single Product by ID

- **GET** `/api/admin/products/:id`
- **Description:** Retrieves a single product by its ID.
- **Auth:** Admin Required.
- **Success (200):** `{ "product": {...} }`

#### 4. Update Product

- **PUT** `/api/admin/products/:id`
- **Description:** Updates an existing product. Also uses `multipart/form-data`.
- **Auth:** Admin Required.
- **Headers:** `Content-Type: multipart/form-data`
- **Body (form-data):** Any fields to update. New images will replace old ones.
- **Success (200):** `{ "message": "Product updated successfully", "product": {...} }`

#### 5. Delete Product

- **DELETE** `/api/admin/products/:id`
- **Description:** Deletes a product by its ID.
- **Auth:** Admin Required.
- **Success (200):** `{ "message": "Product deleted successfully" }`

---

## Running the Project Locally

1.  Create a `.env` file and populate it with your own credentials, including `FRONTEND_URL=http://localhost:3000`.
2.  Run `npm install` to install dependencies.
3.  Run `npm start` to start the server on `http://localhost:5000`.

**🚀 Backend is production-ready and fully tested!**

- **GET** `/api/admin/products/:id`
- **Description:** Retrieves a single product by its ID.
- **Auth:** Admin Required.
- **Success (200):** `{ "product": {...} }`

#### 4. Update Product

- **PUT** `/api/admin/products/:id`
- **Description:** Updates an existing product. Also uses `multipart/form-data`.
- **Auth:** Admin Required.
- **Headers:** `Content-Type: multipart/form-data`
- **Body (form-data):** Any fields to update. New images will replace old ones. Use the same `FormData` approach as for adding a product.
- **Success (200):** `{ "message": "Product updated successfully", "product": {...} }`

#### 5. Delete Product

- **DELETE** `/api/admin/products/:id`
- **Description:** Deletes a product by its ID.
- **Auth:** Admin Required.
- **Success (200):** `{ "message": "Product deleted successfully" }`

---

## Running the Project Locally

1.  Create a `.env` file and populate it with your own credentials.
2.  Run `npm install` to install dependencies.
3.  Run `npm start` to start the server on `http://localhost:5000`.

**🚀 Backend is production-ready and fully tested!**
**GET** `/api/admin/products/:id`

- **Success (200):** `{ "product": {...} }`

#### 4. Update Product

**PUT** `/api/admin/products/:id`

- **Headers:** `Content-Type: multipart/form-data`
- **Body (form-data):** Any fields to update. If you are sending new images, they will replace the old ones. The same rules for JSON strings apply here.
- **Success (200):** `{ "message": "Product updated successfully", "product": {...} }`

#### 5. Delete Product

**DELETE** `/api/admin/products/:id`

- **Success (200):** `{ "message": "Product deleted successfully" }`

---

## Running the Project Locally

1. Create a `.env` file based on the provided variables.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server.

**🚀 Backend is production-ready and fully tested!**

```

```
