# Ecommerce Backend API

## Project Structure

```
backend/
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── adminCheck.js
│
├── config/
│   ├── db.js
│   └── passport.js
│
├── utils/
│   └── validator.js
│
├── .env
├── server.js
└── package.json
```

## User Endpoints

### Get Logged-in User's Profile

**GET** `/api/user/profile`  
Headers: Requires authentication

#### Response

```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "9876543210",
    "provider": "local",
    "googleId": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### Update Logged-in User's Profile

**PATCH** `/api/user/profile`  
Headers: Requires authentication

#### Request Body (any of these fields)

```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "9999999999",
  "password": "NewPassword123!",
  "oldPassword": "CurrentPassword123!"
}
```

#### Response

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "New Name",
    "email": "newemail@example.com",
    "role": "user",
    "phone": "9999999999",
    "provider": "local",
    "googleId": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Auth Endpoints

### Register: **POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

### Login: **POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

### Logout: **POST** `/api/auth/logout`

### Get Current User: **GET** `/api/auth/me`

### Google OAuth Login:

- **GET** `/api/auth/google`
- **GET** `/api/auth/google/callback`

---

- All endpoints require JWT in HTTP-only cookie or Bearer token (where applicable).
- All responses are JSON.
- For Google login, use browser for OAuth flow, then use the returned token for API requests.

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages.
- Validation errors return 400 status.
- Unauthorized access returns 401 status.

## Security

- Passwords are hashed using bcrypt.
- JWT tokens are stored in HTTP-only cookies.
- CORS is enabled for cross-origin requests.
- Use HTTPS in production.

## Environment Variables

- All secrets and configuration are stored in `.env`.
- Never commit `.env` to version control.

## Running the Project

```bash
npm install
npm start
```

## Contributing

- Follow the folder structure.
- Write clean, commented code.
- Add tests for new features.

---

## Notes

- All responses set a JWT token in a secure, HTTP-only cookie.
- Use these endpoints and sample data to test authentication with Postman.
- For Google login, endpoint and instructions are included above.
- Keep controllers, routes, and middleware in their respective folders for maintainability.

## How to Test User Update API

### 1. Register a User

**POST** `/api/auth/register`

```json
{
  "name": "Mahesh Jadhao",
  "email": "mahesh@example.com",
  "password": "Test@1234"
}
```

---

### 2. Login

**POST** `/api/auth/login`

```json
{
  "email": "mahesh@example.com",
  "password": "Test@1234"
}
```

- Copy the JWT token from the cookie or use it as a Bearer token for the next requests.

---

### 3. Update Profile

**PATCH** `/api/user/profile`  
Headers:  
`Authorization: Bearer <your_token_here>` (if not using cookies)

#### Example 1: Update name and phone

```json
{
  "name": "Mahesh J.",
  "phone": "9876543210"
}
```

#### Example 2: Update email (will overwrite the email)

```json
{
  "email": "mahesh.jadhao@newmail.com"
}
```

#### Example 3: Change password (requires old password)

```json
{
  "oldPassword": "Test@1234",
  "password": "NewPass@123"
}
```

---

### 4. Get Profile

**GET** `/api/user/profile`  
Headers:  
`Authorization: Bearer <your_token_here>`

---

**Note:**

- Always login first to get the token.
- Use the token in the `Authorization` header for PATCH/GET requests if not using cookies.
- For password change, both `oldPassword` and new `password` are required.
