# 🚀 Quick Deployment Guide

**Status**: Project is production-ready! Follow these steps to deploy.

---

## 30-Second Pre-Flight Check

```bash
# Verify everything is still working
npx tsc --noEmit        # Should pass with 0 errors
pnpm build              # Should complete successfully
```

✅ Both pass? You're good to deploy!

---

## 5-Minute Setup for Production

### Step 1: Generate Secure Secrets

```bash
# Generate strong JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output
```

### Step 2: Create Production .env

```env
# Copy from .env.example and fill in:

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
MONGODB_DB=Realbase
JWT_SECRET=<paste-the-generated-secret-here>
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

### Step 3: Test Build

```bash
# Clean build
rm -rf .next
pnpm build

# Should complete with 0 errors
```

---

## Deploy to Vercel (Recommended - 2 Minutes)

### Prerequisites
- GitHub account with code pushed
- Vercel account (free tier available)

### Steps

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set Environment Variables:
   ```
   MONGODB_URI = <your-production-mongodb-uri>
   MONGODB_DB = Realbase
   JWT_SECRET = <your-generated-secret>
   NEXT_PUBLIC_API_URL = <your-vercel-domain>
   NODE_ENV = production
   ```
4. Click "Deploy"
5. Done! 🎉

**Vercel will automatically:**
- Build your app
- Deploy to CDN globally
- Provide HTTPS
- Set up auto-scaling

---

## Deploy to Docker (Self-Hosted)

### Create `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production

COPY . .

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
```

### Build & Run

```bash
# Build image
docker build -t dwelas-app .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="<your-mongo-uri>" \
  -e JWT_SECRET="<your-secret>" \
  -e MONGODB_DB="Realbase" \
  -e NEXT_PUBLIC_API_URL="https://yourdomain.com" \
  dwelas-app
```

---

## Deploy to Railway/Render/Fly (1-Click Alternatives)

### Railway
1. Connect GitHub repo to Railway
2. Add environment variables
3. Railway auto-detects Next.js and deploys

### Render
1. Create new Web Service
2. Connect GitHub
3. Add environment variables
4. Auto-deploys on git push

### Fly.io
```bash
flyctl launch
# Follows interactive prompts
# Set environment variables when asked
```

---

## Post-Deployment Checklist

### Immediate (First 5 Minutes)
- [ ] Test homepage loads: `https://yourdomain.com`
- [ ] Test login page: `https://yourdomain.com/login`
- [ ] Test API health: `https://yourdomain.com/api/health`
- [ ] Check browser console for errors (F12)

### Functional (First 30 Minutes)
- [ ] User registration works
- [ ] User login works
- [ ] View properties
- [ ] Search properties
- [ ] Create property (if logged in as admin)
- [ ] Dashboard loads

### Monitoring (Ongoing)
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring (Uptime Robot)
- [ ] Set up database backups (MongoDB Atlas)
- [ ] Monitor API response times

---

## Common Issues & Fixes

### "Cannot connect to MongoDB"
```
Solution: Check MONGODB_URI environment variable
- Verify credentials are correct
- Check IP is whitelisted in MongoDB Atlas
- Verify connection string format
```

### "JWT_SECRET is undefined"
```
Solution: Set JWT_SECRET environment variable
- Don't forget it when deploying!
- Use strong random 32+ character string
```

### "Port 3000 is already in use"
```
Solution: Change port
export PORT=3001
npm start
```

### "Build fails with TypeScript errors"
```
Solution: Run locally first
pnpm build
# Fix any errors shown
```

---

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.net/db` | ✅ Yes |
| `MONGODB_DB` | `Realbase` | ✅ Yes |
| `JWT_SECRET` | `a1b2c3d4e5f6...` (32+ chars) | ✅ Yes |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com` | ✅ Yes |
| `NODE_ENV` | `production` | ⚠️ Recommended |

---

## Rolling Back

If something goes wrong after deployment:

### Vercel
- Go to Deployments tab
- Click previous deployment
- Click "Redeploy"

### Docker
- Roll back image: `docker run <previous-image-id>`

### Git
```bash
git revert HEAD
git push
# Automatic redeploy in most platforms
```

---

## Monitoring & Maintenance

### Weekly
- Check error tracking dashboard
- Review slow API endpoints
- Check database size

### Monthly
- Update dependencies: `pnpm update`
- Review security updates
- Check API usage patterns

### Quarterly
- Security audit
- Performance optimization
- Feature planning

---

## Useful Commands

```bash
# Local testing
pnpm dev                    # Start dev server
pnpm build                  # Build for production
npx tsc --noEmit           # Type check

# Database
node scripts/createIndexes.ts  # Create DB indexes

# Deployment
pnpm start                  # Start production server
vercel deploy              # Deploy to Vercel
docker build -t app .      # Build Docker image
```

---

## Support Resources

📚 **Documentation**
- `SETUP_LOCAL.md` - Local development
- `PRODUCTION_CHECKLIST.md` - Pre-deployment guide
- `FINAL_REPORT.md` - Complete project analysis

🔗 **Links**
- Next.js: https://nextjs.org/docs/deployment
- MongoDB: https://docs.mongodb.com
- Vercel: https://vercel.com/docs

---

## You're Ready! 🎉

Your app is production-ready. Choose a deployment platform above and get it live!

**Questions?** Check the main documentation files in the project root.

**Happy deploying!** 🚀
