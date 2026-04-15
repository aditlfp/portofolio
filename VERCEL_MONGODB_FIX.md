# Vercel Deployment with MongoDB

## 🚨 Issue: Still Using SQLite in Vercel

If you're seeing `SqliteError: unable to open database file` in Vercel logs, it means your environment variables aren't configured correctly.

## ✅ Solution Steps

### 1. Check Vercel Environment Variables

Go to your Vercel dashboard:
1. **Project Settings** → **Environment Variables**
2. **Add the following variables** (case-sensitive!):

```
DB_PROVIDER=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=portfolio
JWT_SECRET=your-secure-secret-key-min-32-chars
NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app
```

### 2. Environment Variable Requirements

**Required for MongoDB:**
- ✅ `DB_PROVIDER=mongodb` (exactly this value)
- ✅ `MONGODB_URI` (your full MongoDB connection string)
- ✅ `MONGODB_DB` (your database name, e.g., `portfolio`)

**Optional but recommended:**
- ✅ `JWT_SECRET` (secure random string)
- ✅ `NEXT_PUBLIC_SITE_URL` (your Vercel domain)

### 3. Redeploy After Adding Variables

**Important:** Environment variable changes require a new deployment!

```bash
# Commit your changes
git add .
git commit -m "Add Vercel MongoDB config"
git push origin main

# Vercel will auto-deploy, or trigger manual deployment
```

### 4. Debug Your Configuration

After deployment, check these endpoints:

**Environment Variables Check:**
```
GET https://your-project.vercel.app/api/debug/env
```

**Database Provider Check:**
```
GET https://your-project.vercel.app/api/debug/db
```

### 5. Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `SqliteError: unable to open database file` | Still using SQLite | Check `DB_PROVIDER` is set to `mongodb` |
| `MONGODB_URI not set` | Missing URI | Add `MONGODB_URI` in Vercel dashboard |
| `Invalid DB_PROVIDER` | Wrong value | Must be exactly `mongodb` (lowercase) |
| `MongoDB connection error` | Wrong URI format | Check URI starts with `mongodb+srv://` |

### 6. MongoDB Atlas Setup (if needed)

1. **Create MongoDB Atlas Cluster:**
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Get connection string

2. **Whitelist Vercel IPs:**
   - In Atlas: **Network Access** → **Add IP Address**
   - Add: `0.0.0.0/0` (allow all) or Vercel's IP ranges

3. **Create Database User:**
   - **Database Access** → **Add New Database User**
   - Username: `vercel`
   - Password: strong password
   - Built-in Role: `Read and write`

### 7. Vercel Environment Variable Tips

- **Case Sensitive:** `DB_PROVIDER` not `db_provider`
- **No Quotes:** Just the value, no quotes around it
- **Preview/Production:** Set for both environments if needed
- **Redeploy Required:** Changes don't apply to existing deployments

### 8. Test Your Setup

After deployment, try logging in. If you see MongoDB connection logs instead of SQLite errors, it's working!

**Expected logs:**
```
🔍 DB_PROVIDER validation: { DB_PROVIDER: 'mongodb', ... }
✅ MongoDB provider selected and configured
🚀 Final database provider: mongodb
📊 Database provider type: mongodb
```

**Not expected (still broken):**
```
SqliteError: unable to open database file
```

### 9. Alternative: Use Supabase

If MongoDB is too complex, you can use Supabase instead:

```env
DB_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 10. Need Help?

1. Check `/api/debug/env` - shows what env vars are set
2. Check `/api/debug/db` - shows which provider is selected
3. Check Vercel function logs for detailed error messages
4. Verify MongoDB URI format and credentials

---

## 📞 Quick Debug Commands

```bash
# Check if env vars are set
curl https://your-project.vercel.app/api/debug/env

# Check database provider
curl https://your-project.vercel.app/api/debug/db

# Check Vercel logs
# Go to Vercel Dashboard → Functions → Check runtime logs
```

---

**Status:** Follow these steps and your Vercel deployment will use MongoDB instead of SQLite! 🎉