# Real Estate Application - Enhancement Documentation

## Overview

This document provides a comprehensive guide to the enhanced real estate application, detailing all improvements, configurations, and implementation steps.

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Components](#components)
7. [Cloudinary Integration](#cloudinary-integration)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Features

### ✅ Completed Enhancements

1. **Dynamic Search Functionality**
   - Server-side filtering by location, price range, bedrooms, property type
   - Pagination support
   - Real-time search with query parameters
   - Sorting options (price, rating, featured)

2. **Property Edit Functionality**
   - Admin property edit page at `/admin/properties/[id]/edit`
   - Pre-filled forms with existing property data
   - Image upload support with Cloudinary
   - Full CRUD operations via API

3. **Property Status Management**
   - Added `suspended` and `sold` statuses to property schema
   - Admin panel UI updated to display and filter by new statuses
   - Status badges with appropriate icons and colors

4. **Cloudinary Image Management**
   - All image uploads (properties, user avatars) use Cloudinary
   - Automatic base64 to Cloudinary URL conversion
   - Organized folder structure (`dwelas/properties`, `dwelas/avatars`)
   - Only Cloudinary URLs stored in database

5. **User Profile Management**
   - Dynamic profile data fetching
   - Real-time profile updates
   - Avatar upload with Cloudinary integration
   - Server-side authentication validation

6. **Loading Animations**
   - Standardized loading components (`LoadingCard`, `LoadingSpinner`, `LoadingOverlay`, `LoadingTable`)
   - Consistent loading states across the application
   - Skeleton loaders for better UX

---

## Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: v5.x or higher
- **Cloudinary Account**: Free tier is sufficient
- **npm** or **yarn**: Latest version

---

## Environment Setup

### 1. Clone and Install

```bash
cd dwelasversion-antigravity
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-database-name
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

MONGODB_DBNAME=your-database-name

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy your **Cloud Name**, **API Key**, and **API Secret**
4. Add them to `.env.local`

### 4. MongoDB Setup

#### Local MongoDB:
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/data/directory
```

#### MongoDB Atlas:
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Get connection string and add to `.env.local`

---

## Database Schema

### Properties Collection

```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  price: number,
  priceUsd?: number | null,
  listingType: "sale" | "rent",
  location: string,
  type: "residential" | "commercial" | "land",
  beds?: number,
  baths?: number,
  sqft?: number,
  images: string[], // Cloudinary URLs
  ownerId: string,
  agentId?: string,
  status: "pending" | "approved" | "rejected" | "suspended" | "sold",
  approvedAt?: Date,
  approvedBy?: string,
  rejectionReason?: string,
  amenities: string[],
  contact: {
    name: string,
    email: string,
    phone: string
  },
  views: number,
  favorites: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,
  password: string, // hashed
  firstName: string,
  lastName: string,
  phone?: string,
  location?: string,
  bio?: string,
  company?: string,
  specialization?: string,
  avatar?: string, // Cloudinary URL
  role: "user" | "admin" | "agent",
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Properties

#### `GET /api/properties`
Fetch properties with filtering and pagination.

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected, suspended, sold)
- `location` - Filter by location (case-insensitive regex)
- `type` - Filter by listing type (sale, rent)
- `propertyType` - Filter by property type (residential, commercial, land)
- `beds` - Minimum number of bedrooms
- `priceMin` - Minimum price
- `priceMax` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 200)

**Response:**
```json
{
  "properties": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

#### `POST /api/properties`
Create a new property listing.

**Request Body:**
```json
{
  "title": "Modern Apartment",
  "description": "Beautiful apartment...",
  "price": 500000,
  "listingType": "sale",
  "location": "New York, USA",
  "type": "residential",
  "beds": 3,
  "baths": 2,
  "sqft": 1500,
  "images": ["base64-string-or-url"],
  "amenities": ["parking", "pool"],
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

#### `GET /api/properties/[id]`
Fetch a single property by ID.

#### `PATCH /api/properties/[id]`
Update a property.

**Request Body:** Same as POST, partial updates allowed.

#### `DELETE /api/properties/[id]`
Delete a property.

### Users

#### `GET /api/users/me`
Get current authenticated user profile.

#### `PUT /api/users/me`
Update current user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": "New York",
  "bio": "Real estate enthusiast",
  "company": "ABC Realty",
  "specialization": "Residential",
  "avatar": "base64-string-or-url"
}
```

---

## Components

### Loading Components

Located in `components/loading.tsx`:

```typescript
// Spinner only
<LoadingSpinner size="sm|md|lg" />

// Card with message
<LoadingCard message="Loading..." />

// Full-screen overlay
<LoadingOverlay message="Processing..." />

// Table skeleton
<LoadingTable rows={5} />
```

### Usage Example

```typescript
import { LoadingCard } from "@/components/loading";

function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <LoadingCard message="Loading properties..." />;
  }
  
  return <div>Content</div>;
}
```

---

## Cloudinary Integration

### How It Works

1. **Client Side**: User selects image → Converted to base64 data URL
2. **API Route**: Receives base64 → Uploads to Cloudinary → Returns secure URL
3. **Database**: Only Cloudinary URL is stored

### Upload Function

```typescript
import { uploadToCloudinary } from "@/lib/cloudinary";

// Upload image
const cloudinaryUrl = await uploadToCloudinary(
  base64String,
  "dwelas/properties" // folder
);
```

### Folder Structure

- `dwelas/properties` - Property images
- `dwelas/avatars` - User profile pictures

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Enhanced real estate app"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy

### MongoDB Atlas (Production)

1. Create production cluster
2. Add Vercel IP addresses to whitelist (or use 0.0.0.0/0)
3. Update `MONGODB_URI` in Vercel environment variables

---

## Troubleshooting

### Common Issues

#### 1. **Cloudinary Upload Fails**

**Error:** `Image upload failed`

**Solution:**
- Verify environment variables are set correctly
- Check Cloudinary dashboard for API limits
- Ensure base64 string is properly formatted

#### 2. **MongoDB Connection Error**

**Error:** `Failed to connect to MongoDB`

**Solution:**
```bash
# Check MongoDB is running
mongod --version

# Test connection
mongo mongodb://localhost:27017
```

#### 3. **Search Returns No Results**

**Solution:**
- Ensure properties have `status: "approved"`
- Check filter parameters in URL
- Verify MongoDB indexes

#### 4. **Type Errors**

**Error:** `Cannot find module 'mongodb'`

**Solution:**
```bash
npm install --save-dev @types/node @types/mongodb
```

#### 5. **Images Not Displaying**

**Solution:**
- Check Cloudinary URLs are valid
- Verify CORS settings in Cloudinary dashboard
- Check browser console for errors

---

## Development Workflow

### Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## Key Files Modified

1. **Schema Updates**
   - `app/api/lib/models/Property.ts` - Added suspended/sold statuses

2. **API Routes**
   - `app/api/properties/route.ts` - Search filters, Cloudinary integration
   - `app/api/properties/[id]/route.ts` - CRUD operations
   - `app/api/users/me/route.ts` - Profile updates with Cloudinary

3. **Pages**
   - `app/search/page.tsx` - Dynamic search with loading states
   - `app/admin/properties/page.tsx` - New status badges, edit links
   - `app/admin/properties/[id]/edit/page.tsx` - NEW: Edit property page
   - `app/dashboard/profile/ProfileCard.tsx` - Dynamic profile updates

4. **Utilities**
   - `lib/cloudinary.ts` - Cloudinary upload helper
   - `components/loading.tsx` - NEW: Loading components

---

## Next Steps / Future Enhancements

- [ ] Add property image gallery with carousel
- [ ] Implement property comparison feature
- [ ] Add email notifications for status changes
- [ ] Implement advanced search with map integration
- [ ] Add property analytics dashboard
- [ ] Implement property favorites/wishlist
- [ ] Add social sharing features
- [ ] Implement review and rating system

---

## Support

For issues or questions:
1. Check this README
2. Review error logs in browser console
3. Check MongoDB and Cloudinary dashboards
4. Verify environment variables

---

## License

This project is proprietary software. All rights reserved.

---

**Last Updated:** November 2025
**Version:** 2.0.0
