# 🌐 Deployment Guide

## Backend Deployment (Render)

### Step 1: Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit: StockManager app"
git branch -M main
git remote add origin https://github.com/yourusername/stockmanager.git
git push -u origin main
```

### Step 2: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster:

   - Choose FREE tier (M0)
   - Select a region close to you
   - Click "Create Cluster"

4. Create Database User:

   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `stockmanager`
   - Password: Generate secure password
   - User Privileges: Read and write to any database

5. Allow Network Access:

   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for testing)
   - Or add specific IPs for production

6. Get Connection String:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://stockmanager:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stockmanager?retryWrites=true&w=majority`

### Step 3: Deploy Backend to Render

1. Go to https://render.com
2. Sign up / Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:

   - **Name**: `stockmanager-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:

   - Click "Advanced"
   - Add:
     ```
     PORT = 5000
     MONGODB_URI = your_mongodb_atlas_connection_string
     JWT_SECRET = your_super_secret_jwt_key_at_least_32_chars
     ```

7. Click "Create Web Service"

8. Wait for deployment (5-10 minutes)

9. Your API URL: `https://stockmanager-api.onrender.com`

### Step 4: Test Backend

```bash
# Test health endpoint
curl https://stockmanager-api.onrender.com

# Should return: {"message":"StockManager API is running"}
```

## Frontend Deployment

### Option 1: Expo Publish (Easiest)

1. Update API URL in `frontend/src/services/api.js`:

```javascript
const API_URL = "https://stockmanager-api.onrender.com";
```

2. Commit changes:

```bash
git add .
git commit -m "Update API URL for production"
git push
```

3. Publish to Expo:

```bash
cd frontend
npx expo login
npx expo publish
```

4. Share the Expo Go link with testers!

### Option 2: Build Standalone APK

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure EAS:

```bash
cd frontend
eas login
eas build:configure
```

3. Build Android APK:

```bash
eas build -p android --profile preview
```

4. Download APK from link provided

### Option 3: Build for Production

```bash
# Android
eas build -p android

# iOS (requires Apple Developer account)
eas build -p ios
```

## Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] MongoDB connection working
- [ ] Can create account (signup)
- [ ] Can login
- [ ] Can add products
- [ ] Can perform stock operations
- [ ] Transactions are logged
- [ ] AI predictions working
- [ ] Dashboard shows correct data

## Monitoring & Maintenance

### Check Backend Logs (Render)

1. Go to your Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Monitor for errors

### Check MongoDB Usage (Atlas)

1. Go to MongoDB Atlas dashboard
2. Click "Metrics" on your cluster
3. Monitor:
   - Connection count
   - Data size
   - Operation count

### Free Tier Limits

**Render Free Tier:**

- Apps sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month free
- Resets on 1st of each month

**MongoDB Atlas Free Tier:**

- 512 MB storage
- Shared RAM
- No backup
- Perfect for demos and small apps

## Upgrade Considerations

### When to Upgrade Backend:

- Need faster response times
- App has consistent traffic
- Need custom domain
- Require more memory/CPU

**Render Starter Plan**: $7/month

- No sleeping
- Custom domains
- More resources

### When to Upgrade Database:

- Storage > 512 MB
- Need backups
- Require better performance
- High concurrent connections

**MongoDB M2 Plan**: $9/month

- 2 GB storage
- Dedicated RAM
- Automated backups

## Custom Domain Setup (Optional)

### Backend Domain

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render:

   - Go to your service
   - Click "Settings"
   - Add custom domain
   - Update DNS records as instructed

3. Update frontend API_URL with new domain

### Frontend Domain (Web Version)

1. Build web version:

```bash
cd frontend
npx expo export:web
```

2. Deploy to Netlify/Vercel:
   - Upload `web-build` folder
   - Configure domain
   - Set environment variables

## Troubleshooting Deployment

### Backend won't start

- Check Render logs for errors
- Verify environment variables are set
- Test MongoDB connection string locally

### Frontend can't connect

- Verify API_URL is correct (no trailing slash)
- Check CORS is enabled in backend
- Test API endpoint in browser

### MongoDB connection timeout

- Check Network Access settings in Atlas
- Verify connection string format
- Ensure password doesn't contain special characters (or URL encode them)

### Render app sleeping

- Use a service like UptimeRobot to ping your API every 5 minutes
- Or upgrade to paid plan

## Cost Summary (Free Start)

| Service       | Free Tier     | Cost After Upgrade     |
| ------------- | ------------- | ---------------------- |
| Render        | 750 hrs/month | $7/month (Starter)     |
| MongoDB Atlas | 512 MB        | $9/month (M2)          |
| Expo          | Unlimited     | $29/month (Production) |
| **Total**     | **$0**        | **$16-45/month**       |

## Security Best Practices

1. **Change default secrets**:

   - Generate strong JWT_SECRET (min 32 chars)
   - Use different secrets for dev/prod

2. **Secure MongoDB**:

   - Use strong database password
   - Limit IP access in production
   - Enable connection encryption

3. **Environment variables**:

   - Never commit `.env` to git
   - Use different values for prod/dev
   - Rotate secrets regularly

4. **API rate limiting** (future):
   - Add express-rate-limit
   - Prevent brute force attacks
   - Protect against DDoS

## Backup Strategy

### Database Backups

```bash
# Manual backup
mongodump --uri="your_mongodb_uri" --out=./backup

# Restore
mongorestore --uri="your_mongodb_uri" ./backup
```

### Code Backups

- Keep GitHub repo updated
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

---

**Your app is now live! Share it with the world! 🚀**
