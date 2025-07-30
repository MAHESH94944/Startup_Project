# Ecommerce Backend API

**Live Backend URL:** `https://warner-and-spencer-shoes.onrender.com`

**Status:** ✅ **LIVE AND WORKING**

---

## API Endpoints

### Health Check

**GET** `/health`

#### Response

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 1. Register User

**POST** `/api/auth/register`

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

#### Success Response (201)

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Error Response (400)

```json
{
  "message": "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
}
```

#### Frontend Handling

- Show loading spinner during request
- On success: redirect to dashboard or show success message
- On error: display validation errors to user
- JWT cookie is automatically set

---

### 2. Login User

**POST** `/api/auth/login`

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

#### Success Response (200)

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Error Response (400)

```json
{
  "message": "Invalid credentials"
}
```

#### Frontend Handling

- Show loading spinner during request
- On success: store user data in localStorage, redirect to dashboard
- On error: show "Invalid email or password" message
- Handle server cold starts with retry logic

---

### 3. Google OAuth Login

**GET** `/api/auth/google`

#### Usage

- Redirect user to this URL for Google login
- Google handles authentication
- User redirected back with JWT cookie set

#### Success Response (after callback)

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "Google User Name",
    "email": "user@gmail.com",
    "role": "user",
    "provider": "google",
    "googleId": "google_user_id"
  }
}
```

#### Frontend Handling

- Add "Login with Google" button that redirects to the endpoint
- After successful login, user sees JSON response with token
- Extract user data and store in localStorage

---

### 4. Get Current User

**GET** `/api/auth/me`

#### Headers

- Requires JWT cookie (automatically sent)

#### Success Response (200)

```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Error Response (401)

```json
{
  "message": "Not authorized, no token"
}
```

#### Frontend Handling

- Use on app initialization to check if user is logged in
- If 401 error: redirect to login page
- If success: set user as authenticated

---

### 5. Get User Profile

**GET** `/api/user/profile`

#### Headers

- Requires JWT cookie (automatically sent)

#### Success Response (200)

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
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Response (401)

```json
{
  "message": "Unauthorized: No user logged in"
}
```

#### Frontend Handling

- Use for profile page to show detailed user information
- Display all user fields in profile form
- Handle loading states

---

### 6. Update User Profile

**PATCH** `/api/user/profile`

#### Headers

- Requires JWT cookie (automatically sent)

#### Request Body (any combination)

```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "9999999999",
  "password": "NewPassword123!",
  "oldPassword": "CurrentPassword123!"
}
```

#### Success Response (200)

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
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### Error Responses

```json
// Password change for social login users
{
  "message": "You cannot change password for social login account"
}

// Wrong old password
{
  "message": "Old password incorrect"
}

// Email already exists
{
  "message": "Email already exists"
}

// Weak password
{
  "message": "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
}
```

#### Frontend Handling

- Create profile edit form with individual field updates
- For password change: require old password field
- Show success message on update
- Update localStorage with new user data
- Handle specific error messages

---

### 7. Logout User

**POST** `/api/auth/logout`

#### Headers

- Requires JWT cookie (automatically sent)

#### Success Response (200)

```json
{
  "message": "Logged out successfully"
}
```

#### Frontend Handling

- Call on logout button click
- Clear localStorage user data
- Redirect to login page
- Show "Logged out successfully" message

---

## Frontend Integration Guide

### Essential Request Configuration

```javascript
// Always include credentials for cookie-based auth
fetch(url, {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Error Handling Best Practices

```javascript
// Handle different error types
if (response.status === 401) {
  // Redirect to login
  localStorage.removeItem("user");
  window.location.href = "/login";
} else if (response.status === 400) {
  // Show validation error
  const data = await response.json();
  showErrorMessage(data.message);
} else if (response.status === 503) {
  // Server cold start - retry
  setTimeout(() => retryRequest(), 3000);
}
```

### Loading States

- Show spinners during API calls
- Disable submit buttons while processing
- Handle server cold start delays (up to 30 seconds)

### Authentication Flow

1. **App Load**: Call `/api/auth/me` to check if user is logged in
2. **Login**: Call `/api/auth/login` and store user data
3. **Protected Routes**: Check localStorage for user data
4. **Logout**: Call `/api/auth/logout` and clear data

### Data Storage

- Store user info in `localStorage` for persistence
- Update localStorage after profile updates
- Clear localStorage on logout or 401 errors

---

## Important Notes

- **Cold Starts**: First request may take 10-30 seconds on free tier
- **Cookies**: JWT tokens are HTTP-only cookies, handled automatically
- **CORS**: Configured to allow all origins with credentials
- **Security**: Passwords are hashed, sensitive data is protected
- **Validation**: Strong password requirements enforced
- **Error Messages**: User-friendly error responses provided

**🚀 Backend is production-ready and fully tested!**
