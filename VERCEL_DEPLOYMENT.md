# 🚀 Complete Vercel Deployment Guide

This guide will walk you through deploying your Dwelas real estate platform to Vercel from start to finish.

## Prerequisites

Before you begin, ensure you have:

- ✅ A GitHub account
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ A MongoDB Atlas account with a production database
- ✅ Your code pushed to a GitHub repository

---

## Step 1: Prepare Your MongoDB Database

### 1.1 Create Production Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (or use existing)
3. Click **"Connect"** on your cluster
4. Choose **"Connect your application"**
5. Copy the connection string (format: `mongodb+srv://...`)

### 1.2 Configure Database Security

1. **Network Access**: 
   - Go to **Network Access** in MongoDB Atlas
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Vercel's serverless functions

2. **Database User**:
   - Go to **Database Access**
   - Create a new user with **Read and Write** permissions
   - Use a strong, auto-generated password
   - Save the username and password securely

### 1.3 Test Connection String

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

Replace `username` and `password` with your actual credentials.

---

## Step 2: Generate Secure Secrets

### 2.1 Generate JWT Secret

Open PowerShell and run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - this is your `JWT_SECRET`. It should be 64 characters long.

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2.2 Prepare Other Credentials (Optional)

If you're using these features, prepare:

- **Flutterwave** credentials (for payments)
- **Email service** credentials (for notifications)
- **Cloudinary** credentials (for image uploads)

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git (if not already done)

```powershell
cd "c:\Users\MUCER\Desktop\PROJECTS 2023-2024-2025\v0-dwelas-up2\dwelasversion-antigravity"
git init
git add .
git commit -m "Prepare for Vercel deployment"
```

### 3.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., "dwelas-platform")
3. **Do NOT** initialize with README, .gitignore, or license

### 3.3 Push to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### 4.2 Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4.3 Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster...` | Your MongoDB connection string |
| `MONGODB_DB` | `Realbase` | Database name |
| `JWT_SECRET` | `[your-generated-secret]` | 64-character secret from Step 2.1 |
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_API_URL` | Leave empty for now | We'll update this after deployment |

#### Optional Variables (if using these features)

**Flutterwave Payment Integration:**
```
FLW_PUBLIC_KEY=FLWPUBK-xxxxx
FLW_SECRET_KEY=FLWSECK-xxxxx
FLW_ENCRYPTION_KEY=xxxxx
FLW_CLIENT_ID=xxxxx
FLW_CLIENT_SECRET=xxxxx
```

**Email Service (Nodemailer):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Cloudinary (Image Uploads):**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes for the build to complete
3. You'll see a success screen with your deployment URL

---

## Step 5: Post-Deployment Configuration

### 5.1 Update API URL

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to your Vercel project settings
3. Navigate to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL` and set it to your deployment URL
5. Click **"Save"**
6. Go to **Deployments** tab and click **"Redeploy"** on the latest deployment

### 5.2 Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `dwelas.com`)
3. Follow Vercel's instructions to update your DNS records
4. Once verified, update `NEXT_PUBLIC_API_URL` to your custom domain
5. Redeploy

---

## Step 6: Verification Checklist

### 6.1 Basic Functionality

Visit your deployment URL and test:

- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] Properties are displayed
- [ ] Search functionality works
- [ ] Filters work correctly

### 6.2 Authentication

- [ ] Sign up page loads
- [ ] Can create a new account
- [ ] Login page loads
- [ ] Can log in with credentials
- [ ] Can log out
- [ ] Protected routes redirect to login when not authenticated

### 6.3 Admin Features (if applicable)

- [ ] Admin dashboard accessible
- [ ] Can view properties
- [ ] Can approve/reject properties
- [ ] Can manage users

### 6.4 Browser Console

1. Open browser DevTools (F12)
2. Check the **Console** tab
3. Verify:
   - [ ] No critical errors
   - [ ] No failed API requests
   - [ ] No CORS errors

### 6.5 Network Tab

1. Open **Network** tab in DevTools
2. Reload the page
3. Verify:
   - [ ] All API calls return 200 or expected status codes
   - [ ] No 500 errors
   - [ ] MongoDB connection successful

---

## Step 7: Performance & Security

### 7.1 Run Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Click **"Generate report"**
4. Target scores:
   - Performance: 80+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

### 7.2 Verify Security Headers

1. Visit [securityheaders.com](https://securityheaders.com)
2. Enter your deployment URL
3. Verify these headers are present:
   - Strict-Transport-Security
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
   - Referrer-Policy

### 7.3 Test HTTPS

- [ ] Site loads over HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate is valid

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```
Solution: Check package.json dependencies
- Run: npm install locally
- Commit package-lock.json
- Push to GitHub
```

**Error: "TypeScript errors"**
```
Solution: Fix TypeScript errors locally first
- Run: npx tsc --noEmit
- Fix all errors
- Commit and push
```

### Database Connection Fails

**Error: "MongoServerError: Authentication failed"**
```
Solution: Check MongoDB credentials
- Verify username and password in MONGODB_URI
- Ensure special characters in password are URL-encoded
- Example: p@ssw0rd → p%40ssw0rd
```

**Error: "MongoServerError: IP not whitelisted"**
```
Solution: Update MongoDB Network Access
- Go to MongoDB Atlas → Network Access
- Add IP: 0.0.0.0/0 (Allow from anywhere)
```

### Environment Variables Not Working

**Error: "JWT_SECRET is undefined"**
```
Solution: Verify environment variables in Vercel
- Go to Vercel project → Settings → Environment Variables
- Ensure all required variables are set
- Redeploy after adding variables
```

### API Routes Return 500

**Check Vercel Function Logs:**
1. Go to Vercel project dashboard
2. Click **"Deployments"**
3. Click on latest deployment
4. Click **"Functions"** tab
5. View logs for errors

---

## Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics** (included)
   - Automatically enabled
   - View in Vercel dashboard → Analytics

2. **Error Tracking** (recommended)
   - Set up [Sentry](https://sentry.io) for error tracking
   - Add Sentry DSN to environment variables

3. **Uptime Monitoring** (recommended)
   - Use [UptimeRobot](https://uptimerobot.com) (free)
   - Monitor your deployment URL
   - Get alerts if site goes down

### Regular Maintenance

**Weekly:**
- Check Vercel function logs for errors
- Review MongoDB usage and performance
- Check for security updates

**Monthly:**
- Update dependencies: `npm update`
- Review and rotate secrets if needed
- Check database backups in MongoDB Atlas

---

## Rollback Procedure

If something goes wrong after deployment:

### Quick Rollback

1. Go to Vercel project → **Deployments**
2. Find the previous working deployment
3. Click **"..."** menu → **"Promote to Production"**
4. Your site will instantly rollback

### Git Rollback

```powershell
# Revert to previous commit
git revert HEAD
git push

# Vercel will auto-deploy the reverted version
```

---

## Additional Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## Support

If you encounter issues:

1. Check Vercel function logs
2. Review MongoDB Atlas logs
3. Check browser console for client-side errors
4. Review this guide's troubleshooting section

---

## Success! 🎉

Your Dwelas platform is now live on Vercel!

**Next Steps:**
- Share your deployment URL
- Set up a custom domain
- Configure monitoring and alerts
- Plan your first marketing campaign

**Your deployment URL:** `https://your-app.vercel.app`

Happy deploying! 🚀
