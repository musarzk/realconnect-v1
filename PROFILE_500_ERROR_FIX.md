# 🔴 500 ERROR - PROFILE SAVE TROUBLESHOOTING

## The Error
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Save error Error: Update failed
```

---

## 🔍 Root Causes Found & Fixed

### Issue #1: Database Name Mismatch ✅ FIXED
**Problem**: 
- `.env.local` defines: `MONGODB_DB=Realbase`
- But `mongodb.ts` looks for: `MONGODB_DBNAME`
- Result: Falls back to "smartreal" database (wrong database!)

**Fix Applied**:
```typescript
// BEFORE
const dbName = process.env.MONGODB_DBNAME ?? "smartreal"

// AFTER
const dbName = process.env.MONGODB_DBNAME ?? process.env.MONGODB_DB ?? "smartreal"
```

---

### Issue #2: JWT_SECRET With Leading Space ✅ FIXED
**Problem**:
```env
JWT_SECRET= $%%eriti977@&%$
         ↑ SPACE HERE!
```
This leading space causes JWT parsing to fail.

**Fix Applied**:
```env
JWT_SECRET=$%%eriti977@&%$
```

---

### Issue #3: Unsafe Property Access ✅ FIXED
**Problem**: The code was accessing properties without null checks:
```typescript
const safe = {
  id: u._id.toString(),  // ❌ Could fail if _id is null
  email: u.email,         // ❌ Could be undefined
  firstName: u.firstName, // ❌ Could be undefined
  // ...
};
```

**Fix Applied**:
```typescript
const safe = {
  id: u._id?.toString?.() ?? null,  // ✅ Safe
  email: u.email ?? null,            // ✅ Safe
  firstName: u.firstName ?? null,    // ✅ Safe
  // ...
};
```

---

### Issue #4: Better Error Logging ✅ FIXED
**Problem**: Couldn't debug when update returns no value

**Fix Applied**:
```typescript
const result = await users.findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: "after" });
if (!result || !result.value) {
  console.error("PUT /api/users/me: Update returned no value", { auth, oid, update });
  return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
}
```

---

## 📋 Diagnostic Checklist

### ✅ Environment Variables
```bash
# Check .env.local contains:
✅ MONGODB_URI=mongodb+srv://...
✅ MONGODB_DB=Realbase (no quotes, no leading space)
✅ JWT_SECRET=... (no leading space, min 32 chars recommended)
✅ NEXT_PUBLIC_API_URL=http://localhost:3000
```

### ✅ Database Configuration
```bash
# Verify:
✅ MONGODB_DB variable name (not MONGODB_DBNAME)
✅ Database name matches MongoDB database
✅ User has credentials to access that database
✅ IP whitelist includes your machine (if using MongoDB Atlas)
```

### ✅ Authentication
```bash
# Verify:
✅ JWT token is being set in cookie
✅ JWT token contains valid userId
✅ JWT_SECRET matches between login and PUT request
✅ Token hasn't expired
```

### ✅ User Document
```bash
# Verify in MongoDB:
✅ User document exists in 'users' collection
✅ Document has _id (MongoDB ObjectId)
✅ Document has email, firstName, lastName fields
✅ No validation errors preventing updates
```

---

## 🧪 Test the Fix

### Step 1: Stop the server
```bash
# Ctrl+C in the terminal running pnpm dev
```

### Step 2: Clear cache
```bash
rm -rf .next
```

### Step 3: Start the server
```bash
pnpm dev
```

### Step 4: Test the endpoint
```bash
# 1. Go to: http://localhost:3000/login
# 2. Log in with your credentials
# 3. Go to: http://localhost:3000/dashboard/profile
# 4. Edit your profile
# 5. Click "Save"
# 
# Expected: Profile updates successfully ✅
# If error: Check browser console and server logs for details
```

---

## 🐛 If Error Persists

### Check Server Logs
When you PUT /api/users/me, look for error messages in the terminal running `pnpm dev`:

```bash
# Good log (successful):
PUT /api/users/me 200 in 150ms

# Bad log (error):
PUT /api/users/me 500 in 850ms
PUT /api/users/me error: [ERROR MESSAGE]
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `User not found` | No user doc with this ID | Check MongoDB for user document |
| `Invalid user id` | userId from JWT is not valid ObjectId | Regenerate JWT token |
| `Unauthorized` | No valid JWT token | Login again |
| `Invalid JSON body` | Request body is malformed | Check ProfileCard sending valid JSON |
| `Update returned no value` | User doesn't exist in DB | Create/verify user exists |

### Manual Database Check

```javascript
// In MongoDB Atlas console:
use Realbase
db.users.find({})  // See all users
db.users.findOne({ _id: ObjectId("your-id") })  // Check specific user
```

---

## 📊 Changes Made

### Files Modified (3)

| File | Change |
|------|--------|
| `.env.local` | Removed quotes from MONGODB_DB, removed space from JWT_SECRET |
| `app/api/lib/mongodb.ts` | Added fallback to MONGODB_DB if MONGODB_DBNAME not set |
| `app/api/users/me/route.ts` | Added null safety, better error logging |

### TypeScript Check
```
✅ npx tsc --noEmit - PASS
```

---

## 🚀 Expected Behavior After Fix

### PUT /api/users/me Should Now:
1. ✅ Authenticate the user (get JWT from cookie)
2. ✅ Connect to correct MongoDB database (Realbase)
3. ✅ Find the user document by ID
4. ✅ Update allowed fields (firstName, lastName, etc.)
5. ✅ Return 200 with updated user data
6. ✅ Profile card updates with new values
7. ✅ Success message shown to user

---

## 📝 Code Changes Summary

### Before
```typescript
// ❌ Wrong database name
const dbName = process.env.MONGODB_DBNAME ?? "smartreal"

// ❌ Unsafe property access
const safe = {
  id: u._id.toString(),
  email: u.email,
  // ...
};
```

### After
```typescript
// ✅ Correct database name fallback
const dbName = process.env.MONGODB_DBNAME ?? process.env.MONGODB_DB ?? "smartreal"

// ✅ Safe property access
const safe = {
  id: u._id?.toString?.() ?? null,
  email: u.email ?? null,
  // ...
};
```

---

## ✨ Status

```
✅ Database name issue: FIXED
✅ JWT_SECRET format: FIXED
✅ Property access safety: FIXED
✅ Error logging: IMPROVED
✅ Ready to test: YES

Next Step: Try saving profile again!
```

---

## 💡 Prevention Tips

1. **Always trim environment variables** (no leading/trailing spaces)
2. **Use null coalescing** (??) for optional fields
3. **Log detailed errors** for debugging
4. **Verify environment vars** match your database setup
5. **Test API endpoints** manually before relying on them

---

## 📞 Support

If the error persists after these fixes:

1. **Check server logs** for the actual error message
2. **Verify MongoDB** connection and database name
3. **Ensure user document** exists in MongoDB
4. **Confirm JWT token** is valid and not expired
5. **Test with cURL** or Postman to isolate the issue

```bash
# Manual API test with cURL:
curl -X PUT http://localhost:3001/api/users/me \
  -H "Content-Type: application/json" \
  -c cookies.txt -b cookies.txt \
  -d '{"firstName":"John","lastName":"Doe"}'
```

---

**The 500 error should now be resolved!** 🎉

Try saving your profile again and let me know if you see any other errors in the console.
