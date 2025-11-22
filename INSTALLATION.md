# 🚀 Installation Commands

## Quick Installation (Copy & Paste)

### Prerequisites Check

```powershell
# Check Node.js version (should be v16+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version

# Check if Expo CLI is installed
expo --version
```

---

## Backend Setup

### Navigate to backend folder

```powershell
cd d:\Projects\StockManager\backend
```

### Install dependencies

```powershell
npm install
```

### Verify .env file exists

```powershell
cat .env
```

### If .env doesn't exist, create it:

```powershell
@"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockmanager
JWT_SECRET=hackathon_secret_key_2024_stockmanager
"@ | Out-File -FilePath .env -Encoding utf8
```

### Start MongoDB (if not running)

```powershell
# In a new terminal
mongod
```

### Seed sample data (Optional but recommended)

```powershell
npm run seed
```

Demo credentials will be: **demo@stockmanager.com** / **demo123456**

### Start backend server

```powershell
npm run dev
```

Expected output:

```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

**Keep this terminal open!**

---

## Frontend Setup

### Open a NEW terminal and navigate to frontend

```powershell
cd d:\Projects\StockManager\frontend
```

### Install dependencies

```powershell
npm install
```

### Install Expo CLI globally (if not installed)

```powershell
npm install -g expo-cli
```

### Start Expo development server

```powershell
npm start
```

### Or use specific platform:

```powershell
# For Android
npm run android

# For iOS (Mac only)
npm run ios
```

---

## Run on Device

### Option 1: Expo Go App (Easiest)

1. Install **Expo Go** from:

   - iOS: App Store
   - Android: Google Play Store

2. Scan QR code from terminal with:
   - iOS: Camera app
   - Android: Expo Go app

### Option 2: Android Emulator

1. Install Android Studio
2. Setup Android Virtual Device (AVD)
3. Start emulator
4. Run: `npm run android`

### Option 3: iOS Simulator (Mac only)

1. Install Xcode
2. Run: `npm run ios`

---

## Update API URL (Important for Physical Devices)

### Find your computer's IP address:

```powershell
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

### Edit frontend API configuration:

```powershell
code frontend\src\services\api.js
```

Change API_URL to:

```javascript
// For local development (same machine)
const API_URL = "http://localhost:5000";

// For Android emulator
const API_URL = "http://10.0.2.2:5000";

// For iOS simulator or physical device (replace with YOUR IP)
const API_URL = "http://192.168.1.100:5000";
```

---

## Troubleshooting

### Port 5000 already in use:

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### MongoDB not starting:

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service
net start MongoDB
```

### Frontend can't connect to backend:

```powershell
# Test backend is running
curl http://localhost:5000

# Should return: {"message":"StockManager API is running"}
```

### Clear Expo cache:

```powershell
cd frontend
npx expo start -c
```

### Reinstall dependencies:

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Frontend
cd ../frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

## Verification Checklist

After installation, verify:

### Backend:

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Can access http://localhost:5000
- [ ] Health check returns JSON response

### Frontend:

- [ ] Expo dev server starts
- [ ] QR code appears
- [ ] No compilation errors
- [ ] Can scan QR code with Expo Go

### App:

- [ ] Splash screen loads
- [ ] Can reach login screen
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads

---

## Common Commands Reference

### Backend:

```powershell
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server (hot reload)
npm start            # Start production server
npm run seed         # Seed sample data
```

### Frontend:

```powershell
cd frontend
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS (Mac only)
npx expo start -c    # Clear cache and start
```

### MongoDB:

```powershell
mongod               # Start MongoDB server
mongo                # Open MongoDB shell
```

### Git:

```powershell
git init             # Initialize repository
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to remote
```

---

## Production Deployment

### Deploy Backend:

```powershell
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Then follow DEPLOYMENT.md for Render setup
```

### Deploy Frontend:

```powershell
cd frontend

# Update API URL in src/services/api.js
# Then publish:
npx expo publish

# Or build APK:
eas build -p android --profile preview
```

---

## Environment Variables

### Backend (.env):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockmanager
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Production MongoDB (MongoDB Atlas):

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stockmanager?retryWrites=true&w=majority
```

---

## Quick Start (All-in-One)

Copy and paste this entire block:

```powershell
# Navigate to project
cd d:\Projects\StockManager

# Install backend
cd backend
npm install
npm run seed
Start-Process powershell -ArgumentList "cd $PWD; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Install and start frontend
cd ..\frontend
npm install
npm start
```

---

## Success Indicators

You'll know everything is working when you see:

### Terminal 1 (Backend):

```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Terminal 2 (Frontend):

```
Metro waiting on exp://192.168.1.100:8081
› Press a | open Android
› Press i | open iOS simulator
› Press w | open web
```

### Device/Emulator:

- Splash screen with blue background
- "StockManager" logo
- Navigation to login screen

---

**Installation complete! Start building! 🎉**
