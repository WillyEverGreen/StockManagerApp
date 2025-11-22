# 📦 StockManager - AI-Powered Inventory Management

A complete React Native inventory management app with **AI Stock-Out Prediction**, built for a 6-hour hackathon MVP.

## 🎯 Features

### ✅ Core Features

1. **Authentication**

   - Login & Signup
   - JWT-based authentication
   - Persistent sessions (stays logged in)

2. **Product Management**

   - Add, edit, and delete products
   - Search by SKU or product name
   - View product details
   - Low stock highlighting (red indicators)

3. **Stock In (Receipts)**

   - Select product from dropdown
   - Enter quantity to add
   - Automatic stock update
   - Transaction logging

4. **Stock Out (Deliveries)**

   - Select product from dropdown
   - Enter quantity to remove
   - Prevents negative stock
   - Transaction logging with usage history

5. **Dashboard**

   - Total products count
   - Total stock level
   - Low stock alerts count
   - Recent transactions list
   - Quick action buttons

6. **Transactions Log**
   - Complete history of all stock movements
   - Filter by type (All, In, Out)
   - View transaction details

### 🤖 AI Prediction Engine (Winning Feature!)

- **Predicts when stock will run out** based on usage history
- **Formula**: `predictedDays = currentStock / averageDailyUsage`
- Shows on:
  - Product list cards
  - Product detail screen (prominent prediction card)
  - Dashboard alerts
- Color-coded status:
  - 🔴 Critical (≤3 days)
  - 🟠 Warning (≤7 days)
  - 🟡 Caution (≤14 days)
  - 🟢 Good (>14 days)

## 🛠 Tech Stack

### Frontend

- **React Native** + Expo
- React Navigation (Bottom tabs + Stack)
- AsyncStorage for persistence
- Axios for API calls
- Clean UI with StyleSheet (warehouse theme)

### Backend

- **Node.js** + Express
- **MongoDB** + Mongoose
- JWT authentication
- CORS enabled
- RESTful API

## 📁 Project Structure

```
StockManager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── stock.js
│   │   └── transactions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── SplashScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── ProductsScreen.js
│   │   │   ├── AddProductScreen.js
│   │   │   ├── EditProductScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   ├── StockInScreen.js
│   │   │   ├── StockOutScreen.js
│   │   │   └── TransactionsScreen.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── prediction.js
│   │   └── styles/
│   │       └── globalStyles.js
│   ├── AppNavigator.js
│   ├── App.js
│   ├── app.json
│   └── package.json
└── README.md
```

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Expo CLI: `npm install -g expo-cli`
- Git

### Step 1: Clone & Setup

```bash
# Clone the repository
cd d:\Projects\StockManager

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### Step 2: Configure Backend

1. Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockmanager
JWT_SECRET=hackathon_secret_key_2024_stockmanager
```

2. Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Configure Frontend API URL

Edit `frontend/src/services/api.js`:

```javascript
// For local development
const API_URL = "http://localhost:5000";

// For Android emulator
const API_URL = "http://10.0.2.2:5000";

// For iOS simulator (use your machine's IP)
const API_URL = "http://192.168.1.XXX:5000";

// For physical device (use your machine's IP)
const API_URL = "http://192.168.1.XXX:5000";
```

### Step 5: Start Frontend

```bash
cd frontend
npm start
```

Then:

- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## 🚀 Quick Start for Developers

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd StockManager
    ```

2.  **Install Dependencies (One Command)**

    ```bash
    npm run install-all
    ```

    _This installs dependencies for root, backend, and frontend automatically._

3.  **Setup Environment**

    - Go to `backend/` and copy `.env.example` to `.env`
    - Update MongoDB URI if needed.

4.  **Run the App**

    ```bash
    npm start
    ```

    _This starts both the Backend Server and Expo Frontend concurrently._

5.  **Scan & Go**
    - Scan the QR code in the terminal with Expo Go.

---

## 📱 Usage Guide

### First Time Setup

1. Launch the app
2. Click "Sign Up"
3. Create an account
4. You're automatically logged in!

### Adding Your First Product

1. Go to **Dashboard** → Click "Add Product"
2. Fill in:
   - Product Name: "Widget A"
   - SKU: "WGT001"
   - Initial Stock: 100
   - Min Stock: 20
3. Click "Add Product"

### Receiving Stock

1. Go to **Dashboard** → Click "Stock In"
2. Select product from dropdown
3. Enter quantity to add
4. Click "Add Stock"

### Delivering Stock

1. Go to **Dashboard** → Click "Stock Out"
2. Select product
3. Enter quantity to remove
4. Click "Remove Stock"
   - ⚠️ Can't go below 0!

### Viewing AI Predictions

- **Products Screen**: Shows prediction on each card
- **Product Detail**: Large prediction card with color status
- **Dashboard**: Low stock alerts include predictions

## 🧮 AI Prediction Logic

```javascript
// Average daily usage from last transactions
averageDailyUsage = sum(usageHistory) / usageHistory.length;

// Predicted days until stock runs out
predictedDays = currentStock / averageDailyUsage;

// Example:
// Stock: 50 units
// Usage history: [5, 10, 8, 7, 10] (last 5 deliveries)
// Average: 8 units/day
// Prediction: 50 / 8 = 6.25 days → "Runs out in ~6 days"
```

## 🌐 Deployment

### Backend Deployment (Render.com - Free)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

2. **Deploy on Render**

   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - Name: `stockmanager-api`
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Add Environment Variables:
       - `MONGODB_URI`: Your MongoDB connection string
       - `JWT_SECRET`: Your secret key
       - `PORT`: 5000
   - Click "Create Web Service"

3. **Get your API URL**: `https://stockmanager-api.onrender.com`

### MongoDB Atlas (Free Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (Free M0)
4. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Use this in Render environment variables

### Frontend Deployment (Expo)

1. **Update API URL** in `frontend/src/services/api.js`:

```javascript
const API_URL = "https://stockmanager-api.onrender.com";
```

2. **Build APK for Android**:

```bash
cd frontend
eas build -p android --profile preview
```

3. **Or publish to Expo**:

```bash
expo publish
```

## 🧪 Testing the App

### Test Credentials

After signup, use any account you create. No special test accounts needed!

### Test Scenario

1. **Add 3 products**:

   - Product A (SKU: PROD001, Stock: 100, Min: 20)
   - Product B (SKU: PROD002, Stock: 50, Min: 15)
   - Product C (SKU: PROD003, Stock: 10, Min: 10)

2. **Perform stock operations**:

   - Stock Out: Product A → 10 units (repeat 3-4 times)
   - Stock In: Product B → 50 units
   - Stock Out: Product C → 5 units

3. **Check Dashboard**:

   - See updated stats
   - View recent transactions
   - Check low stock alerts

4. **View Predictions**:
   - Go to Products list
   - See AI predictions on Product A (should show prediction after deliveries)
   - Click on Product A → See detailed prediction card

## 🎨 UI Theme

- **Primary Color**: Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Danger**: Red (#ef4444)
- **Background**: Light gray (#f1f5f9)
- **Cards**: White with subtle shadows
- **Industrial warehouse aesthetic**

## 📊 API Endpoints

### Auth

- `POST /auth/signup` - Create account
- `POST /auth/login` - Login

### Products

- `GET /products` - Get all products (with optional search)
- `GET /products/:id` - Get single product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Stock

- `POST /stock/in` - Add stock
- `POST /stock/out` - Remove stock

### Transactions

- `GET /transactions` - Get all transactions
- `GET /transactions/product/:productId` - Get product transactions

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check MongoDB is running
mongod

# Check .env file exists
cd backend
cat .env

# Check port 5000 is free
netstat -ano | findstr :5000
```

### Frontend can't connect to API

```bash
# Check API URL in api.js
# For Android emulator use: http://10.0.2.2:5000
# For iOS simulator use your machine's IP: http://192.168.1.XXX:5000
```

### MongoDB connection error

```bash
# Check MongoDB connection string
# Make sure MongoDB is running
# Check firewall settings
```

## 🏆 Hackathon Winning Features

✅ Complete full-stack app in 6 hours
✅ Clean, professional UI
✅ AI prediction engine (unique feature!)
✅ Real-time stock tracking
✅ Transaction history
✅ Low stock alerts
✅ Mobile-first design
✅ Production-ready code
✅ Easy deployment

## 📝 Future Enhancements

- [ ] Barcode scanning
- [ ] Export reports (PDF/CSV)
- [ ] Multi-user support with roles
- [ ] Product categories
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Email notifications for low stock
- [ ] Advanced analytics dashboard
- [ ] Dark mode

## 👨‍💻 Developer Notes

- **JWT tokens expire in 30 days**
- **Usage history keeps last 10 transactions** for prediction accuracy
- **All timestamps are in ISO format**
- **SKUs are automatically uppercased**
- **Minimum stock default is 10 units**

## 📄 License

MIT License - Feel free to use for your hackathon or personal projects!

## 🙌 Credits

Built with ❤️ for hackathon success!

---

**Ready to win? Deploy and demo! 🚀**
