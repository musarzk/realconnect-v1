# Static vs Dynamic Data - Comprehensive Audit

## Summary
❌ **CRITICAL FINDING:** Multiple pages still use hardcoded mock data. Only homepage and search page have working dynamic fetching.

---

## STATIC (Hardcoded Mock Data) - NEEDS CONVERSION

### 1. **Admin Properties Page** (`app/admin/properties/page.tsx`)
**Status:** ❌ STATIC - Using hardcoded mock data
**Location:** Lines 25-60+
**Current Data:**
- 5 hardcoded property objects with mock IDs (1-5)
- Manual property management (add/delete/approve)

**What's Static:**
```tsx
const [properties, setProperties] = useState([
  { id: 1, title: "Modern Apartment", location: "New York, USA", price: 850000, status: "approved", owner: "John Doe", views: 245 },
  // ... 4 more hardcoded properties
])
```

**To Make Dynamic:**
- [ ] Add `useEffect` hook to fetch from `/api/properties` 
- [ ] Fetch with status filter (all, pending, approved, rejected)
- [ ] Real-time updates when properties are approved/deleted
- [ ] Type definitions need `_id`, `priceUsd` fields

---

### 2. **Admin Dashboard** (`app/admin/page.tsx`)
**Status:** ❌ STATIC - Using hardcoded mock analytics
**Location:** Lines 31-68
**Current Data:**
- 6 months of hardcoded monthly statistics
- 5 hardcoded recent activity entries
- Hard-coded platform stats (2,847 properties, 4,291 users, etc.)

**What's Static:**
```tsx
const monthlyData = [
  { month: "Jan", properties: 240, users: 340, revenue: 45000 },
  // ... 5 more hardcoded months
]

const recentActivity = [
  { id: 1, type: "user_joined", user: "John Doe", property: "-", time: "2 minutes ago", status: "success" },
  // ... 4 more hardcoded activities
]
```

**To Make Dynamic:**
- [ ] Create `/api/admin/analytics` endpoint to fetch platform statistics
- [ ] Create `/api/admin/activity` endpoint for recent activity log
- [ ] Add `useEffect` to fetch real data on mount
- [ ] Calculate platform stats from database (count properties, users, etc.)
- [ ] Track and display real recent activity (user signups, property listings, etc.)

---

### 3. **Admin Analytics Page** (`app/admin/analytics/page.tsx`)
**Status:** ❌ STATIC - Using hardcoded mock daily data
**Location:** Lines 20-27
**Current Data:**
- 7 days of hardcoded daily activity (Mon-Sun)
- Hard-coded metrics (4.5m session duration, 24.5% bounce rate, etc.)

**What's Static:**
```tsx
const dailyData = [
  { day: "Mon", users: 120, properties: 45, transactions: 8 },
  // ... 6 more days
]

const metrics = [
  { label: "Avg. Session Duration", value: "4m 32s", change: "+12s" },
  // ... 3 more metrics
]
```

**To Make Dynamic:**
- [ ] Create `/api/admin/daily-analytics` endpoint
- [ ] Fetch last 7 days of actual activity data
- [ ] Calculate metrics from database (sessions, bounce rate, conversions)
- [ ] Add date range picker to view different periods

---

### 4. **Investor Portal** (`app/investor-portal/page.tsx`)
**Status:** ❌ STATIC - Using mock investment opportunities
**Location:** Lines 39-100+
**Current Data:**
- 5+ hardcoded investment properties with mock ROI, risk levels, investor counts

**What's Static:**
```tsx
const mockData: InvestmentProperty[] = [
  {
    id: 1,
    title: "Downtown Commercial Complex",
    location: "New York, USA",
    price: 500000,
    expectedROI: 14.5,
    riskLevel: "medium",
    minInvestment: 50000,
    investors: 24,
    yearsToBreakeven: 5,
  },
  // ... 4 more hardcoded properties
]
```

**To Make Dynamic:**
- [ ] Create `/api/investor-properties` endpoint
- [ ] Fetch investment opportunities from database
- [ ] Add filters by risk level, minimum investment, ROI range
- [ ] Real-time investor count updates
- [ ] Calculate ROI and break-even from property data

---

### 5. **Dashboard Overview** (`app/dashboard/page.tsx`)
**Status:** ❌ PARTIALLY STATIC
**Location:** Lines 10-38
**Current Data:**
- Hardcoded user stats (12 active listings, 2,847 total views, 156 favorites)
- 4 hardcoded recent activity entries

**What's Static:**
```tsx
const stats = [
  { label: "Active Listings", value: "12", icon: Home, change: "+2 this month", color: "text-blue-500" },
  // ... 3 more stats (all hardcoded)
]

const recentActivity = [
  { type: "listing_viewed", property: "Modern Apartment", count: 45, time: "2 hours ago" },
  // ... 3 more activities
]
```

**To Make Dynamic:**
- [ ] Create `/api/dashboard/user-stats` endpoint
- [ ] Fetch authenticated user's property statistics
- [ ] Create `/api/dashboard/activity` endpoint
- [ ] Fetch user's real recent activity (views, favorites, inquiries)
- [ ] Add `useEffect` with auth context to fetch user-specific data
- [ ] Update stats in real-time as properties get interactions

---

### 6. **Dashboard Analytics** (`app/dashboard/analytics/page.tsx`)
**Status:** ❌ STATIC - Using hardcoded mock analytics
**Location:** Lines 21-43
**Current Data:**
- 6 months of hardcoded views/favorites data
- Hardcoded inquiry distribution (45 serious, 32 general, 28 tour requests)
- Hardcoded conversion rates by month

**What's Static:**
```tsx
const viewsData = [
  { month: "Jan", views: 240, favorites: 24 },
  // ... 5 more months
]

const inquiriesData = [
  { name: "Serious Inquiries", value: 45, fill: "#3b82f6" },
  { name: "General Inquiries", value: 32, fill: "#8b5cf6" },
  { name: "Tour Requests", value: 28, fill: "#ec4899" },
]
```

**To Make Dynamic:**
- [ ] Create `/api/dashboard/analytics/views` endpoint
- [ ] Fetch user's property views over time
- [ ] Create `/api/dashboard/analytics/inquiries` endpoint
- [ ] Categorize and fetch real inquiries (serious/general/tour-requests)
- [ ] Create `/api/dashboard/analytics/conversions` endpoint
- [ ] Calculate conversion rates from actual data

---

### 7. **Messages Page** (`app/messages/page.tsx`)
**Status:** ❌ STATIC - Using hardcoded conversations
**Location:** Lines 36-80+
**Current Data:**
- 2+ hardcoded conversations with mock messages
- Mock timestamps (hardcoded as `Date.now()`)
- Hardcoded senders and recipients

**What's Static:**
```tsx
const [conversations, setConversations] = useState<Conversation[]>([
  {
    id: "1",
    recipient: "John Doe",
    recipientRole: "Agent",
    lastMessage: "Are you interested in viewing the property?",
    messages: [
      { id: "m1", sender: "John Doe", content: "Hello! I have a property that might interest you", ... },
      // ... more mock messages
    ],
  },
  // ... more conversations
])
```

**To Make Dynamic:**
- [ ] Create `/api/messages` endpoint to fetch user conversations
- [ ] Create `/api/messages/[conversationId]` for full conversation
- [ ] Add real-time message fetching with WebSocket or polling
- [ ] Fetch authenticated user's actual conversations
- [ ] Display real messages with real timestamps
- [ ] Implement message sending to store in database

---

## DYNAMIC (Database-Driven) - ALREADY WORKING ✅

### 1. **Homepage** (`app/page.tsx`)
**Status:** ✅ DYNAMIC
**Lines:** 240-290
**Implementation:**
- ✅ Fetches from `/api/properties?status=approve`
- ✅ Uses `useEffect` to load on mount
- ✅ Filters by status, location, type, price range, bedrooms
- ✅ Pagination (12 items per page)
- ✅ Sorting (featured, price, rating)
- ✅ Passes `priceUsd` to PropertyCard component
- ✅ Error handling and loading states

**Properties Passed:**
- `_id`, `title`, `price`, `priceUsd`, `location`, `images`, `beds`, `baths`, `sqft`, `verified`, `rating`

---

### 2. **Search Page** (`app/search/page.tsx`)
**Status:** ✅ DYNAMIC
**Lines:** 445-500+
**Implementation:**
- ✅ Fetches from `/api/properties` with query parameters
- ✅ Uses `useEffect` with memoized query string
- ✅ Real-time filtering by location, type, price, beds
- ✅ Pagination updates with API calls
- ✅ Passes `priceUsd` to PropertyCard component
- ✅ Response normalization (handles multiple shapes)
- ✅ Error handling and loading states

**Properties Passed:**
- `_id`, `title`, `price`, `priceUsd`, `location`, `images`, `beds`, `baths`, `sqft`, `verified`, `rating`

---

### 3. **Property Detail Page** (`app/property/[id]/page.tsx`)
**Status:** ⚠️ PARTIALLY DYNAMIC
**Current State:**
- ✅ Shows NGN as primary currency
- ✅ Shows USD as optional secondary
- ❌ Still using hardcoded mock property data (should fetch from API)

**What Needs Fixing:**
- [ ] Replace mock data with API call to `/api/properties/[id]`
- [ ] Fetch real property details on mount
- [ ] Display real images from array
- [ ] Show real agent information
- [ ] Display real reviews/ratings if available

---

### 4. **Profile Page** (`app/dashboard/profile/page.tsx`)
**Status:** ✅ DYNAMIC
**Implementation:**
- ✅ Server component that fetches user from database
- ✅ Authenticates via JWT token from httpOnly cookie
- ✅ Fetches from MongoDB using `getUsersCollection()`
- ✅ Passes user data to client component
- ✅ Error handling for missing user

---

### 5. **Create Property Page** (`app/(protected)/properties/create/page.tsx`)
**Status:** ✅ DYNAMIC
**Implementation:**
- ✅ Form submission to `/api/properties` POST endpoint
- ✅ Accepts NGN price (required)
- ✅ Accepts optional USD price with checkbox toggle
- ✅ React Hook Form + Zod validation
- ✅ Redirect to property detail after creation

---

## API Endpoints Available

### Working Endpoints ✅
- `GET /api/properties` - List approved properties with filters
- `GET /api/properties/[id]` - Get single property detail
- `POST /api/properties` - Create new property
- `PUT /api/properties/[id]` - Update property
- `GET /api/users/[id]` - Get user profile
- `GET /api/auth/me` - Get authenticated user

### Endpoints That Need Creation 🔴
- `GET /api/admin/analytics` - Platform statistics
- `GET /api/admin/activity` - Recent activity log
- `GET /api/admin/daily-analytics` - Daily statistics
- `GET /api/admin/properties` - List all properties (admin view)
- `GET /api/investor-properties` - Investment opportunities
- `GET /api/dashboard/stats` - User's property statistics
- `GET /api/dashboard/activity` - User's recent activity
- `GET /api/dashboard/analytics/views` - User's views over time
- `GET /api/dashboard/analytics/inquiries` - User's inquiries
- `GET /api/dashboard/analytics/conversions` - User's conversion rates
- `GET /api/messages` - List user's conversations
- `GET /api/messages/[conversationId]` - Get conversation messages
- `POST /api/messages` - Send new message

---

## Priority Ranking (Highest to Lowest)

### 🔴 CRITICAL (User-Facing Features)
1. **Property Detail Page** - Users see hardcoded property data
2. **Messages Page** - Can't send/receive real messages
3. **Dashboard Overview** - Shows fake user stats
4. **Dashboard Analytics** - Shows fake analytics

### 🟠 HIGH (Admin/Seller Features)
5. **Admin Properties** - Can't manage real properties
6. **Dashboard Analytics** - Sellers can't see real stats
7. **Investor Portal** - Shows fake investment opportunities

### 🟡 MEDIUM (System Monitoring)
8. **Admin Dashboard** - Can't see real platform stats
9. **Admin Analytics** - Can't see real platform analytics

---

## Implementation Checklist

### Phase 1: Fix User-Facing Pages (URGENT)
- [ ] Update Property Detail to fetch from API
- [ ] Add message fetch endpoints and update Messages page
- [ ] Update Dashboard Overview with real user stats
- [ ] Update Dashboard Analytics with real analytics

### Phase 2: Fix Admin Pages
- [ ] Create Admin Analytics API endpoints
- [ ] Update Admin Dashboard to fetch real stats
- [ ] Update Admin Properties to fetch from API
- [ ] Update Admin Analytics page to fetch real data

### Phase 3: Fix Investor/Portal Pages
- [ ] Create Investor Properties API endpoint
- [ ] Update Investor Portal to fetch real investment opportunities
- [ ] Add filtering and real-time updates

### Phase 4: Polish & Optimization
- [ ] Add caching for frequently accessed data
- [ ] Implement real-time updates where applicable
- [ ] Add data refresh buttons on all pages
- [ ] Performance optimization for large datasets

---

## Code Changes Summary

**Total Static Areas Found:** 7 major pages + 1 partially static
**Fully Dynamic:** 5 pages/components
**Needs API Endpoints:** 13 new endpoints
**Estimated Effort:** 3-5 days to fully implement

---

## Files Requiring Updates

### Pages to Update
- `app/admin/properties/page.tsx`
- `app/admin/page.tsx`
- `app/admin/analytics/page.tsx`
- `app/investor-portal/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/analytics/page.tsx`
- `app/messages/page.tsx`
- `app/property/[id]/page.tsx` (partially)

### API Endpoints to Create
- `app/api/admin/**`
- `app/api/investor-properties/**`
- `app/api/dashboard/**`
- `app/api/messages/**`

