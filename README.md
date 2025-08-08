# Ecommerce Backend API

**Live Backend URL:** `https://warner-and-spencer-shoes.onrender.com`

**Status:** ✅ **LIVE AND WORKING**

---

## Important Notes for Frontend Team

### Cold Start Handling

- **First request may be slow (10-30 seconds)** due to Render's free tier cold starts.
- **Add loading states** in your frontend and consider retry logic for failed initial requests.
- Use the `/health` endpoint to warm up the server if needed.

### Authentication

- **Cookie-Based Auth**: The backend uses secure, HTTP-only cookies for session management.
- **Include Credentials**: All frontend requests must include `credentials: 'include'` to send cookies.
- **CORS**: CORS is enabled to allow requests from any origin with credentials.

---

## API Endpoints

### Health Check

**GET** `/health` - Use this to check if the server is awake.

- **Success Response (200):** `{"status": "OK", "timestamp": "..."}`

---

### Authentication Endpoints

#### 1. Register User

**POST** `/api/auth/register`

- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Success (201):** `{ "message": "User registered successfully", "user": {...} }`
- **Error (400):** `{ "message": "Email already exists" }` or validation error.

#### 2. Login User

**POST** `/api/auth/login`

- **Body:** `{ "email": "...", "password": "..." }`
- **Success (200):** `{ "message": "Login successful", "user": {...} }`
- **Error (400):** `{ "message": "Invalid credentials" }`

#### 3. Google OAuth Login

**GET** `/api/auth/google`

- **Usage:** Redirect the user to this URL. After Google login, the user will see a JSON response with a `token` and `user` object. The frontend should handle this response to complete the login process.

#### 4. Get Current User

**GET** `/api/auth/me`

- **Headers:** Requires authentication cookie.
- **Success (200):** `{ "user": {...} }`
- **Error (401):** `{ "message": "Not authorized, no token" }`

#### 5. Logout User

**POST** `/api/auth/logout`

- **Headers:** Requires authentication cookie.
- **Success (200):** `{ "message": "Logged out successfully" }`

---

### User Profile Endpoints

#### 1. Get User Profile

**GET** `/api/user/profile`

- **Headers:** Requires authentication cookie.
- **Success (200):** `{ "user": {...} }` (Returns full user profile).

#### 2. Update User Profile

**PATCH** `/api/user/profile`

- **Headers:** Requires authentication cookie.
- **Body:** `{ "name": "...", "phone": "...", "oldPassword": "...", "password": "..." }` (any combination).
- **Success (200):** `{ "message": "Profile updated successfully", "user": {...} }`
- **Error (400):** For incorrect old password, social login password change attempt, etc.

---

### Admin Product Endpoints

_All admin routes require admin-level authentication._

#### 1. Add a New Product

**POST** `/api/admin/products`

- **Headers:** `Content-Type: multipart/form-data` (Postman sets this automatically when you use form-data).
- **Body (form-data):**
  - `img`: (File) One or more image files.
  - `title`: (Text) "Premium Leather Shoes"
  - `price`: (Text) 4999
  - `stock`: (Text) 100
  - `size`: (Text) `[8,9,10]` **(Must be a valid JSON array string)**
  - `color`: (Text) `["Black","Brown"]` **(Must be a valid JSON array string)**
  - `productInformation`: (Text) `{"material":"Leather","care":"Wipe clean"}` **(Must be a valid JSON object string)**
  - ... other text fields

#### How to Test with Postman (form-data)

The "unexpected end of file" error happens because you must send this request as `multipart/form-data`, not as raw JSON, when uploading files.

1.  In Postman, set the request method to **POST**.
2.  Go to the **Body** tab and select **form-data**.
3.  Add your fields as key-value pairs:
    - For **text fields** (`title`, `price`, etc.), enter the key and its value.
    - For **array/object fields** (`size`, `color`, `productInformation`), enter the key and a **valid JSON string** as the value.
    - For **image files**, enter the key (`img`), and in the value column, click the dropdown and select **File**. Then you can choose the image(s) from your computer.

**Example Postman Setup:**

| KEY                  | VALUE                                                      |
| -------------------- | ---------------------------------------------------------- |
| `img`                | (File) `shoe1.jpg`                                         |
| `img`                | (File) `shoe2.jpg`                                         |
| `title`              | `Classic Leather Loafers`                                  |
| `price`              | `3500`                                                     |
| `stock`              | `50`                                                       |
| `size`               | `[8, 9, 10]`                                               |
| `color`              | `["Tan", "Black"]`                                         |
| `productInformation` | `{"material": "Full-grain leather", "care": "Use polish"}` |

---

#### 2. Get All Products

**GET** `/api/admin/products`

- **Query Params (optional):** `page`, `limit`, `search`, `color`, `size`.
- **Success (200):** `{ "products": [...], "totalPages": ..., "currentPage": ..., "total": ... }`

#### 3. Get Single Product by ID

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
