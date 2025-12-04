# 🚀 Quick Deployment Reference Card

## Pre-Deployment Commands

```bash
# 1. Type check
npm run type-check

# 2. Validate environment variables
npm run validate-env

# 3. Build test
npm run build

# 4. Full pre-deploy check
npm run pre-deploy
```

## Required Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=Realbase
JWT_SECRET=[64-character-hex-string]
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Vercel Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import repository
   - Add environment variables
   - Click Deploy

3. **Post-Deploy**
   - Update `NEXT_PUBLIC_API_URL` with deployment URL
   - Redeploy

## Verification Checklist

- [ ] Homepage loads
- [ ] Login/signup works
- [ ] Properties display
- [ ] Search works
- [ ] No console errors
- [ ] API calls succeed

## Troubleshooting

**Build fails**: Check `npm run build` locally
**DB connection fails**: Verify MONGODB_URI and IP whitelist
**JWT errors**: Ensure JWT_SECRET is set and 32+ chars

## Documentation

- Full Guide: `VERCEL_DEPLOYMENT.md`
- Walkthrough: `.gemini/antigravity/brain/.../walkthrough.md`
- Quick Deploy: `QUICK_DEPLOY.md`

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
