# Ecommerce Backend API

**Live Backend URL:** `https://warner-and-spencer-shoes.onrender.com`

## API Endpoints (Sequential Flow)

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

#### Response

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

#### Frontend Implementation

```javascript
// Registration
const register = async (userData) => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("User registered successfully:", data);
      // Redirect to dashboard or login page
    } else {
      console.error("Registration failed:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// Usage
register({
  name: "John Doe",
  email: "john@example.com",
  password: "StrongPassword123!",
});
```

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

#### Response

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

#### Frontend Implementation

```javascript
// Login
const login = async (credentials) => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Login successful:", data);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user info
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// Usage
login({
  email: "john@example.com",
  password: "StrongPassword123!",
});
```

---

### 3. Google OAuth Login

**GET** `/api/auth/google`

#### Frontend Implementation

```javascript
// Google Login - Redirect to Google OAuth
const googleLogin = () => {
  window.location.href =
    "https://warner-and-spencer-shoes.onrender.com/api/auth/google";
};

// Handle Google callback (after successful login)
// Google will redirect to your frontend with user data
// You can check if user is logged in using the /me endpoint
```

---

### 4. Get Current User Info

**GET** `/api/auth/me`

#### Response

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

#### Frontend Implementation

```javascript
// Check if user is authenticated
const getCurrentUser = async () => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/auth/me",
      {
        method: "GET",
        credentials: "include", // Important for cookies
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Current user:", data.user);
      return data.user;
    } else {
      console.log("User not authenticated");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Use this on app load to check authentication
const checkAuth = async () => {
  const user = await getCurrentUser();
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    // User is logged in
  } else {
    localStorage.removeItem("user");
    // Redirect to login
    window.location.href = "/login";
  }
};
```

---

### 5. Get User Profile

**GET** `/api/user/profile`

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

#### Frontend Implementation

```javascript
// Get detailed user profile
const getUserProfile = async () => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/user/profile",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("User profile:", data.user);
      return data.user;
    } else {
      console.error("Failed to get profile:", data.message);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
};
```

---

### 6. Update User Profile

**PATCH** `/api/user/profile`

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

#### Frontend Implementation

```javascript
// Update user profile
const updateProfile = async (updateData) => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/user/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Profile updated:", data);
      localStorage.setItem("user", JSON.stringify(data.user)); // Update stored user
      return data.user;
    } else {
      console.error("Update failed:", data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Usage examples
// Update name only
updateProfile({ name: "New Name" });

// Update phone only
updateProfile({ phone: "9999999999" });

// Change password
updateProfile({
  oldPassword: "CurrentPassword123!",
  password: "NewPassword123!",
});
```

---

### 7. Logout User

**POST** `/api/auth/logout`

#### Response

```json
{
  "message": "Logged out successfully"
}
```

#### Frontend Implementation

```javascript
// Logout
const logout = async () => {
  try {
    const response = await fetch(
      "https://warner-and-spencer-shoes.onrender.com/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Logged out successfully");
      localStorage.removeItem("user"); // Clear stored user data
      // Redirect to login page
      window.location.href = "/login";
    } else {
      console.error("Logout failed:", data.message);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
```

---

## Complete Frontend Auth Service Example

```javascript
// auth.js - Complete authentication service
class AuthService {
  constructor() {
    this.baseURL = "https://warner-and-spencer-shoes.onrender.com/api";
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    return await response.json();
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      credentials: "include",
    });
    return response.ok ? await response.json() : null;
  }

  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      credentials: "include",
    });
    return await response.json();
  }

  async updateProfile(updateData) {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      localStorage.removeItem("user");
    }
    return await response.json();
  }

  googleLogin() {
    window.location.href = `${this.baseURL}/auth/google`;
  }

  isAuthenticated() {
    return localStorage.getItem("user") !== null;
  }

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

// Usage
const authService = new AuthService();
export default authService;
```

## Important Frontend Notes

1. **Always use `credentials: 'include'`** for cookie-based authentication
2. **Store user data in localStorage** for quick access across components
3. **Check authentication on app load** using `/auth/me` endpoint
4. **Handle errors gracefully** and show appropriate messages to users
5. **Clear user data on logout** to prevent stale data
6. **Use HTTPS** in production for secure cookie transmission

---

**Note:** Replace all `localhost:5000` references with `https://warner-and-spencer-shoes.onrender.com` for production use.
