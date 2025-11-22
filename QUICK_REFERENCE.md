# 🎯 StockManager - Quick Reference

## 🚀 Start Commands

### Backend

```powershell
cd backend
npm run dev
```

Server runs on: http://localhost:5000

### Frontend

```powershell
cd frontend
npm start
```

Then press 'a' for Android or 'i' for iOS

## 🔑 Key Features Checklist

- [x] JWT Authentication (Login/Signup)
- [x] Product CRUD (Add/Edit/Delete)
- [x] Search by SKU/Name
- [x] Stock In (Receipts)
- [x] Stock Out (Deliveries)
- [x] Dashboard with KPIs
- [x] Transaction Log
- [x] Low Stock Alerts
- [x] **AI Prediction Engine** ⭐

## 🤖 AI Prediction Formula

```
predictedDays = currentStock / averageDailyUsage
```

Where:

- `currentStock` = Current product stock level
- `averageDailyUsage` = Average of last 10 stock-out quantities

## 📊 Database Schema

### Product

```javascript
{
  name: String,
  sku: String (unique, uppercase),
  stock: Number (min: 0),
  minStock: Number,
  usageHistory: [Number] // last 10 deliveries
}
```

### Transaction

```javascript
{
  productId: ObjectId,
  type: "in" | "out",
  quantity: Number,
  timestamp: Date,
  productName: String,
  productSku: String
}
```

## 🎨 Color Scheme

- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)
- Background: `#f1f5f9` (Light Gray)

## 📱 Navigation Structure

```
Auth Stack:
├── Splash
├── Login
└── Signup

Main Stack:
├── Dashboard Tab
├── Products Tab
│   ├── Product Detail
│   ├── Add Product
│   └── Edit Product
├── Transactions Tab
├── Stock In
└── Stock Out
```

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockmanager
JWT_SECRET=your_secret_key
```

### Frontend (api.js)

```javascript
const API_URL = "http://localhost:5000"; // Change for production
```

## 📦 NPM Scripts

### Backend

- `npm start` - Production mode
- `npm run dev` - Development with nodemon

### Frontend

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS

## 🧪 Test Flow

1. **Signup**: Create account
2. **Add Products**: Create 3 test products
3. **Stock Out**: Remove stock 3-4 times from one product
4. **Check Prediction**: View AI prediction on product detail
5. **Stock In**: Add stock to trigger low stock recovery
6. **Dashboard**: View KPIs and recent transactions

## 🚨 Common Issues

### Can't connect to API

- Check API_URL in `frontend/src/services/api.js`
- Android emulator: Use `http://10.0.2.2:5000`
- Physical device: Use your computer's IP

### MongoDB connection error

- Make sure MongoDB is running: `mongod`
- Check connection string in `.env`

### Module not found

- Run `npm install` in both backend and frontend

## 📈 Deployment Checklist

- [ ] Backend deployed to Render
- [ ] MongoDB migrated to Atlas
- [ ] Frontend API_URL updated
- [ ] Environment variables configured
- [ ] App tested on physical device
- [ ] README.md updated with live URLs

## 🏆 Demo Script

1. Show splash screen and login
2. Navigate to Dashboard - point out KPIs
3. Go to Products - show search functionality
4. Click product - **highlight AI prediction card** ⭐
5. Demonstrate Stock In
6. Demonstrate Stock Out (show prevention of negative stock)
7. Show Transactions log with filters
8. Return to Dashboard - show updated stats

## ⚡ Quick Tips

- SKUs auto-uppercase
- Stock can't go negative
- JWT tokens last 30 days
- Usage history keeps last 10 entries
- All dates in ISO format
- Low stock = stock ≤ minStock

---

**Ready to present? Good luck! 🎉**
