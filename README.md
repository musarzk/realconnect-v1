# SmartReal - Global Real Estate Platform

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/musarzks-projects/v0-dwelasaiversion)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/jAqu5FJfNsk)

## Overview

A production-ready, AI-powered real estate platform built with Next.js 15, TypeScript, and MongoDB. Features global property listings, advanced search, admin dashboard, and comprehensive analytics.

This repository stays in sync with your deployed chats on [v0.app](https://v0.app). Any changes made to your deployed app are automatically pushed to this repository.

## Live Deployment

Your project is live at:
**[https://vercel.com/musarzks-projects/v0-dwelasaiversion](https://vercel.com/musarzks-projects/v0-dwelasaiversion)**

Continue building on:
**[https://v0.app/chat/jAqu5FJfNsk](https://v0.app/chat/jAqu5FJfNsk)**

## Features

### For Buyers & Renters
- Advanced property search with AI-powered recommendations
- Real-time property listings with verified badges
- Interactive image galleries and virtual tours
- Market analysis and price trends
- Booking and inquiry management

### For Sellers
- User-friendly property listing creation
- AI-powered property valuation
- Analytics dashboard with view tracking
- Lead management and inquiry responses
- Marketing tools and featured listings

### For Investors
- Investment opportunity discovery
- ROI calculations and market analysis
- Portfolio tracking
- Risk assessment tools
- Historical market data

### Admin Dashboard
- Complete platform management
- Property moderation and verification
- User management with role-based access
- Advanced analytics and reporting
- System health monitoring

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Express (legacy)
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Data Visualization**: Recharts
- **Form Management**: React Hook Form with Zod validation
- **Real-time Updates**: Firebase (legacy integration)

## Project Structure

\`\`\`
├── app/
│   ├── api/                 # Next.js API routes
│   │   ├── properties/      # Property CRUD endpoints
│   │   ├── users/           # User management endpoints
│   │   ├── bookings/        # Booking system endpoints
│   │   ├── analytics/       # Analytics data endpoints
│   │   └── lib/             # Database and utility functions
│   ├── admin/               # Admin dashboard pages
│   ├── dashboard/           # User dashboard pages
│   ├── search/              # Search and results pages
│   ├── property/            # Property detail pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── navigation.tsx       # Navigation component
│   └── footer.tsx           # Footer component
├── lib/
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── server/                  # Legacy Express server (optional)
├── client/                  # Legacy React frontend (optional)
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- Environment variables configured

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd dwelasaiversion
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables**
Create a `.env.local` file:
\`\`\`
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

### Properties
- `GET /api/properties` - List all properties with filters
- `GET /api/properties/[id]` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

### Users
- `GET /api/users` - List users
- `GET /api/users/[id]` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user profile

### Bookings
- `POST /api/bookings` - Schedule property tour
- `GET /api/bookings` - Get user bookings

### Analytics
- `GET /api/analytics/properties` - Platform statistics

### Health
- `GET /api/health` - API health check

## Key Features Implementation

### Search & Filtering
The search page supports filtering by:
- Location (city, country)
- Price range
- Property type (apartment, house, commercial)
- Bedrooms and bathrooms
- Square footage
- Sorting by price, newest, most viewed

### User Dashboard
- Overview with key metrics
- Listing management with edit/delete
- Interactive analytics charts
- Profile and settings management

### Admin Dashboard
- Real-time platform analytics
- Property moderation queue
- User management
- System monitoring

## Authentication

The platform uses JWT-based authentication:
1. Users register with email and password
2. JWT tokens are issued upon login
3. Protected routes verify tokens
4. Automatic token refresh on expiry

## Database Schema

### Properties Collection
\`\`\`
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  details: {
    beds: Number,
    baths: Number,
    sqft: Number,
    propertyType: String,
    yearBuilt: Number
  },
  images: [String],
  owner: ObjectId,
  status: String, // active, pending, sold
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy with one click

\`\`\`bash
vercel deploy
\`\`\`

### Environment Variables
Add these to your Vercel project:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL` - Public API URL

## Performance Optimizations

- Server-side rendering for SEO
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Caching strategies for API endpoints
- Database indexing on frequently queried fields
- CDN integration for static assets

## Security Considerations

- HTTPS enforced in production
- CORS properly configured
- Input validation with Zod
- SQL injection prevention via MongoDB
- XSS protection headers
- Rate limiting on API endpoints (recommended)
- Environment variables for sensitive data

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Ensure all tests pass

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact support team
- Check documentation

## Roadmap

- [ ] AI-powered property recommendations
- [ ] Virtual property tours with 3D
- [ ] Mobile app (React Native)
- [ ] Blockchain-based property verification
- [ ] Multi-currency support
- [ ] Video call consultations
- [ ] Advanced analytics and reporting
- [ ] Machine learning price predictions

---

Built with ❤️ using Next.js, React, and TypeScript
