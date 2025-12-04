# Local Development Setup Guide

This guide walks you through running the SmartReal platform locally on your machine.

## Prerequisites

Before you start, make sure you have the following installed:

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Git** - [Download from git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **MongoDB** - Choose one option:
   - **Option A (Recommended)**: [MongoDB Atlas Cloud](https://www.mongodb.com/cloud/atlas)
     - Free tier available, no local installation needed
   - **Option B**: [Local MongoDB Installation](https://docs.mongodb.com/manual/installation/)
     - Download and install MongoDB Community Edition for your OS

4. **Code Editor** - [VS Code](https://code.visualstudio.com/) (recommended)

5. **Terminal/Command Line**
   - Windows: Command Prompt, PowerShell, or WSL
   - macOS/Linux: Terminal or preferred shell

---

## Step 1: Clone the Repository

Open your terminal and run:

\`\`\`bash
# Clone the repository
git clone https://github.com/musarzks/v0-dwelasaiversion.git

# Navigate to the project directory
cd v0-dwelasaiversion
\`\`\`

---

## Step 2: Set Up MongoDB Connection

### Option A: MongoDB Atlas (Cloud - Easiest)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose Free tier)
4. Click "Connect" and select "Drivers"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
6. Keep this string safe - you'll need it next

### Option B: Local MongoDB

1. Start MongoDB service:
   - **Windows**: Run `mongod` in Command Prompt (or use MongoDB as a service)
   - **macOS**: Run `brew services start mongodb-community`
   - **Linux**: Run `sudo systemctl start mongod`

2. Your connection string will be: `mongodb://localhost:27017/smartreal`

---

## Step 3: Create Environment Variables

1. In your project root directory, create a new file named `.env.local`

2. Copy and paste the following content:

\`\`\`env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (generate a random string)
JWT_SECRET=your_secret_key_here_min_32_characters

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase (optional, for development)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

3. Replace the values:
   - Replace `your_mongodb_connection_string_here` with your MongoDB connection string from Step 2
   - For `JWT_SECRET`, generate a random string (example: `my_super_secret_jwt_key_12345678901234`)

---

## Step 4: Install Dependencies

Run the following command to install all required packages:

\`\`\`bash
npm install
\`\`\`

This will download and install all dependencies listed in `package.json`. This may take 2-5 minutes depending on your internet speed.

---

## Step 5: Start the Development Server

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

You should see output similar to:

\`\`\`
> next dev

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

  ✓ Ready in 2.5s
\`\`\`

---

## Step 6: Access the Application

Open your web browser and navigate to:

\`\`\`
http://localhost:3000
\`\`\`

You should now see the SmartReal homepage with:
- Hero section with search bar
- Featured properties
- Navigation menu
- Footer

---

## Step 7: Test the Application

### Verify Everything is Working

1. **Homepage**: You should see the property listings and search bar
2. **Search**: Click on "Search Properties" or use the search bar to filter properties
3. **Property Details**: Click on any property to view its details
4. **Admin Dashboard**: Visit `http://localhost:3000/admin` to see the admin panel
5. **User Dashboard**: Visit `http://localhost:3000/dashboard` to see user features

### Test API Endpoints

Open another terminal and test the API:

\`\`\`bash
# Check API health
curl http://localhost:3000/api/health

# Get all properties
curl http://localhost:3000/api/properties

# Get platform analytics
curl http://localhost:3000/api/analytics/properties
\`\`\`

---

## Available Commands

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after building)
npm start

# Run linter
npm run lint
\`\`\`

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure you ran `npm install`
\`\`\`bash
npm install
\`\`\`

### Issue: MongoDB connection error

**Solution**: Check your `MONGODB_URI` in `.env.local`
- Verify the connection string is correct
- If using MongoDB Atlas, make sure your IP address is whitelisted
- Check that MongoDB service is running (if using local MongoDB)

### Issue: Port 3000 already in use

**Solution**: Either:
1. Stop the process using port 3000
2. Or run on a different port: `npm run dev -- -p 3001`

### Issue: "Cannot GET /api/health"

**Solution**: 
- Make sure you're at `http://localhost:3000`, not `localhost:3000`
- Refresh the page
- Check browser console (F12) for errors

### Issue: Images not loading

**Solution**: Check that all image files exist in `/public` directory

### Issue: Tailwind CSS not applied

**Solution**: Restart the development server:
\`\`\`bash
# Stop with Ctrl+C, then:
npm run dev
\`\`\`

---

## Project Structure Overview

\`\`\`
v0-dwelasaiversion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── search/            # Search page
│   ├── property/          # Property details
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── public/                # Static files (images, etc)
├── lib/                   # Utility functions
├── .env.local            # Environment variables (create this)
├── next.config.mjs       # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
\`\`\`

---

## Next Steps

1. **Explore the codebase**: Look through the components and pages
2. **Make changes**: Edit files and see changes in real-time (hot reload)
3. **Create new properties**: Use the admin dashboard to add test data
4. **Test features**: Try search, filters, bookings, analytics
5. **Deploy**: When ready, push to GitHub and deploy to Vercel

---

## Common Development Tasks

### Add a new page

1. Create a new file in `app/` or `app/[folder]/page.tsx`
2. Export a default React component
3. The route is automatically created based on the file path

### Add a new API endpoint

1. Create a new file in `app/api/[endpoint]/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` functions
3. Access at `http://localhost:3000/api/[endpoint]`

### Modify styles

1. Edit `app/globals.css` for global styles
2. Use Tailwind CSS classes in components
3. Changes apply automatically (hot reload)

### Debug issues

1. Open browser DevTools: Press `F12`
2. Check Console tab for errors
3. Check Network tab for API calls
4. Look at terminal output where you ran `npm run dev`

---

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Need Help?

If you encounter issues:

1. Check the Troubleshooting section above
2. Look at error messages in the terminal
3. Check browser console (F12 → Console tab)
4. Try restarting: Stop server (Ctrl+C) and run `npm run dev` again
5. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

---

**You're all set! Start developing!** 🚀
