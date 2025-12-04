# Authentication & Authorization Setup Guide

## Overview

This application implements a complete production-ready authentication and authorization system with JWT tokens, role-based access control (RBAC), and protected routes.

## Features

- **JWT-based Authentication**: Secure token generation and verification
- **Role-Based Access Control**: User, Agent, and Admin roles with specific permissions
- **Protected Routes**: Middleware-based route protection on both client and server
- **Secure Password Hashing**: bcryptjs for password encryption
- **Token Refresh**: Automatic token refresh mechanism
- **Server Actions**: Type-safe server-side operations with authorization checks

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file based on `.env.local.example`:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secure-random-secret-key
NODE_ENV=development
\`\`\`

### 2. MongoDB Setup

The application uses MongoDB with the following collections:

- **users**: User accounts with roles and approval status
- **properties**: Real estate listings with ownership and approval tracking
- **bookings**: Property tour/visit bookings
- **messages**: User-to-user messaging
- **notifications**: System notifications

### 3. Authentication Flow

#### Signup
\`\`\`
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
\`\`\`

Response:
\`\`\`json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "approved": false
  }
}
\`\`\`

#### Login
\`\`\`
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

#### Verify Token
\`\`\`
GET /api/auth/me
Authorization: Bearer {token}
\`\`\`

### 4. Role-Based Access Control

#### User Roles

1. **User** (Default)
   - View approved properties
   - Create property listings (pending approval)
   - Create bookings
   - View own profile and bookings
   - Edit own profile

2. **Agent**
   - All User permissions plus:
   - Manage multiple properties
   - View analytics for own listings
   - Priority listing approval

3. **Admin**
   - Full system access
   - Approve/reject properties
   - Manage users (approve, delete, assign roles)
   - View all analytics
   - Manage system settings

### 5. Protected Routes

Routes that require authentication:

- `/dashboard/*` - User dashboard
- `/admin/*` - Admin panel
- `/list-property` - Create property listing
- `/messages` - Messaging system
- `/investor-portal` - Investor portal (members only)

### 6. API Authorization

All protected API endpoints verify JWT token and check authorization:

#### Required Headers
\`\`\`
Authorization: Bearer {jwt_token}
\`\`\`

#### Protected Endpoints

**User Endpoints:**
- `POST /api/users` - Create user (signup)
- `GET /api/users/{id}` - Get user (own or admin)
- `PATCH /api/users/{id}` - Update user (own or admin)
- `DELETE /api/users/{id}` - Delete user (admin only)

**Property Endpoints:**
- `POST /api/properties` - Create property (authenticated users)
- `GET /api/properties` - List properties (public, approved only)
- `GET /api/properties/{id}` - Get property details (public)
- `PATCH /api/properties/{id}` - Update property (owner or admin)
- `DELETE /api/properties/{id}` - Delete property (owner or admin)
- `POST /api/properties/approval` - Approve/reject property (admin only)

**Booking Endpoints:**
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings` - Get bookings (own or admin)

### 7. Middleware

#### Server Middleware (`middleware.ts`)
- Validates JWT tokens on protected routes
- Redirects unauthenticated users to login
- Checks role-based access for admin routes

#### API Middleware (`app/api/lib/middleware.ts`)
- Verifies JWT tokens in API requests
- Extracts user info and role
- Returns error if token invalid or expired

### 8. Server Actions

Type-safe server-side operations with built-in authorization:

\`\`\`typescript
// Property Actions
createProperty(data)
updateProperty(propertyId, data)
deleteProperty(propertyId)
approveProperty(propertyId, approved, rejectionReason?)
togglePropertyFavorite(propertyId)

// User Actions
updateUserProfile(userId, data)
approveUser(userId, approved)
assignUserRole(userId, role)
deleteUser(userId)

// Booking Actions
createBooking(propertyId, bookingData)
getUserBookings()
cancelBooking(bookingId)
\`\`\`

### 9. Security Best Practices

1. **Never store passwords in plain text** - Always hash with bcryptjs
2. **Validate all inputs** - Use Zod schemas for validation
3. **Check authorization** - Verify user owns resource before allowing updates
4. **Rate limiting** - Implement rate limiting on auth endpoints
5. **HTTPS only** - Use HTTPS in production
6. **Secure cookies** - Set httpOnly, Secure flags on authentication cookies
7. **Token expiration** - Implement short-lived access tokens and refresh tokens

### 10. Common Issues & Solutions

**Issue**: "Unauthorized" error on API calls
- Solution: Ensure token is included in Authorization header
- Check token hasn't expired

**Issue**: User can't access admin routes
- Solution: Verify user role is set to "admin"
- Check middleware is working with cookies

**Issue**: Password verification fails
- Solution: Ensure bcrypt is installed
- Verify hash algorithm hasn't changed

## Deployment Checklist

- [ ] Set strong JWT_SECRET in production environment
- [ ] Configure MONGODB_URI with production database
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all authentication flows
- [ ] Backup database
- [ ] Configure email for notifications
- [ ] Set up admin account

## Support

For authentication issues, check:
1. Browser DevTools Console for errors
2. MongoDB connection string
3. JWT_SECRET configuration
4. Network requests in Network tab
5. Server logs for detailed errors
