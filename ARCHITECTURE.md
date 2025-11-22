# 📐 StockManager - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STOCKMANAGER APP                             │
│                   AI-Powered Inventory Management                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          MOBILE APP (React Native)                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AUTH FLOW (Stack)                         │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐               │    │
│  │  │  Splash  │ → │  Login   │ → │  Signup  │               │    │
│  │  └──────────┘   └──────────┘   └──────────┘               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              ↓                                       │
│                      JWT Token Stored                                │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    MAIN APP (Tabs + Stack)                   │    │
│  │                                                              │    │
│  │  Bottom Navigation:                                          │    │
│  │  ┌────────────┬────────────┬────────────┐                   │    │
│  │  │ Dashboard  │  Products  │Transactions│                   │    │
│  │  │    📊      │     📦     │     📋     │                   │    │
│  │  └────────────┴────────────┴────────────┘                   │    │
│  │                                                              │    │
│  │  Stack Screens:                                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │    │
│  │  │   Product   │  │Add Product  │  │Edit Product │         │    │
│  │  │   Detail    │  │             │  │             │         │    │
│  │  │🤖 AI CARD   │  └─────────────┘  └─────────────┘         │    │
│  │  └─────────────┘                                            │    │
│  │  ┌─────────────┐  ┌─────────────┐                          │    │
│  │  │  Stock In   │  │  Stock Out  │                          │    │
│  │  │     📥      │  │     📤      │                          │    │
│  │  └─────────────┘  └─────────────┘                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CORE MODULES                              │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │    │
│  │  │ AuthContext  │  │  API Service │  │🤖 Prediction │     │    │
│  │  │ (User State) │  │   (Axios)    │  │    Engine    │     │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │         Global Styles (Industrial Theme)              │  │    │
│  │  │  Colors: Blue, Gray, Red (low stock), Green, Orange  │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST API ↓
                     (JWT Token in Authorization Header)
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Node.js/Express)                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                       ROUTES                                 │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │  /auth (Public)                                       │  │    │
│  │  │  • POST /signup  → Create account                     │  │    │
│  │  │  • POST /login   → Authenticate & get JWT token       │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │  /products (Protected)                                │  │    │
│  │  │  • GET    /          → List all products              │  │    │
│  │  │  • GET    /:id       → Get product details            │  │    │
│  │  │  • POST   /          → Create new product             │  │    │
│  │  │  • PUT    /:id       → Update product                 │  │    │
│  │  │  • DELETE /:id       → Delete product                 │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │  /stock (Protected)                                   │  │    │
│  │  │  • POST /in  → Add stock (updates usageHistory)       │  │    │
│  │  │  • POST /out → Remove stock (updates usageHistory)    │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │  /transactions (Protected)                            │  │    │
│  │  │  • GET /               → List all transactions        │  │    │
│  │  │  • GET /product/:id    → Product transactions         │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     MIDDLEWARE                               │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │    │
│  │  │    CORS      │  │  JWT Auth    │  │ Body Parser  │     │    │
│  │  │   (Enabled)  │  │  Middleware  │  │    (JSON)    │     │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓ Mongoose ODM ↓
┌──────────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  USERS Collection                                           │     │
│  │  ┌───────────────────────────────────────────────────┐    │     │
│  │  │  _id, email, password (hashed), name, createdAt   │    │     │
│  │  └───────────────────────────────────────────────────┘    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  PRODUCTS Collection                                        │     │
│  │  ┌───────────────────────────────────────────────────┐    │     │
│  │  │  _id, name, sku (unique), stock, minStock,        │    │     │
│  │  │  usageHistory[10 last deliveries], createdAt      │    │     │
│  │  └───────────────────────────────────────────────────┘    │     │
│  │                  ↓ Used by AI Prediction ↓                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  TRANSACTIONS Collection                                    │     │
│  │  ┌───────────────────────────────────────────────────┐    │     │
│  │  │  _id, productId, type (in/out), quantity,         │    │     │
│  │  │  timestamp, productName, productSku               │    │     │
│  │  └───────────────────────────────────────────────────┘    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    🤖 AI PREDICTION ENGINE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  INPUT:                                                               │
│  • currentStock (from Product)                                        │
│  • usageHistory (array of last 10 stock-out quantities)              │
│                                                                       │
│  ALGORITHM:                                                           │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │ Step 1: Calculate average daily usage                      │     │
│  │   averageDailyUsage = sum(usageHistory) / length           │     │
│  │                                                             │     │
│  │ Step 2: Calculate predicted days                           │     │
│  │   predictedDays = currentStock / averageDailyUsage         │     │
│  │                                                             │     │
│  │ Step 3: Determine status color                             │     │
│  │   ≤ 3 days   → 🔴 Critical (Red)                           │     │
│  │   ≤ 7 days   → 🟠 Warning (Orange)                         │     │
│  │   ≤ 14 days  → 🟡 Caution (Yellow)                         │     │
│  │   > 14 days  → 🟢 Good (Green)                             │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  OUTPUT:                                                              │
│  • predictedDays (integer)                                            │
│  • averageDailyUsage (float)                                          │
│  • hasData (boolean)                                                  │
│  • message (string: "Runs out in X days")                            │
│  • status color (for UI)                                              │
│                                                                       │
│  DISPLAYED ON:                                                        │
│  ✅ Product List (small badge)                                        │
│  ✅ Product Detail (large prominent card)                             │
│  ✅ Dashboard (in alerts)                                             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USER ACTION: Stock Out (Delivery)                                   │
│  ────────────────────────────────────────────────────────            │
│                                                                       │
│  1. User selects product: "Widget A"                                 │
│     └─→ Quantity: 15 units                                           │
│                                                                       │
│  2. Frontend sends POST to /stock/out                                │
│     └─→ { productId, quantity: 15 }                                  │
│                                                                       │
│  3. Backend validates:                                               │
│     ├─→ Check if product exists                                      │
│     ├─→ Check if stock sufficient (150 >= 15 ✓)                      │
│     └─→ Prevents negative stock                                      │
│                                                                       │
│  4. Backend updates Product:                                         │
│     ├─→ stock: 150 - 15 = 135                                        │
│     └─→ usageHistory.push(15) → [12,15,10,14,13,11,16,12,15,15]     │
│                                                                       │
│  5. Backend creates Transaction:                                     │
│     └─→ { productId, type: "out", quantity: 15, timestamp }          │
│                                                                       │
│  6. Frontend receives updated product                                │
│     └─→ Recalculates prediction:                                     │
│         avgUsage = 133/10 = 13.3 units/day                          │
│         predicted = 135/13.3 = 10 days                               │
│         status = "Good" (green)                                       │
│                                                                       │
│  7. UI updates automatically:                                        │
│     ├─→ Dashboard: Total stock decreased                             │
│     ├─→ Product list: Shows new prediction                           │
│     ├─→ Transactions: New entry appears                              │
│     └─→ Product detail: Prediction card updates                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐        ┌────────────────┐                       │
│  │  Mobile Devices │  ◄───► │   Expo Go App  │                       │
│  │  (iOS/Android)  │        │  or Standalone │                       │
│  └────────────────┘        └────────────────┘                       │
│         │                           │                                │
│         │ HTTPS                     │                                │
│         ↓                           ↓                                │
│  ┌──────────────────────────────────────────┐                       │
│  │     Backend API (Render.com)             │                       │
│  │  https://stockmanager-api.onrender.com   │                       │
│  └──────────────────────────────────────────┘                       │
│         │                                                             │
│         │ MongoDB Connection String                                  │
│         ↓                                                             │
│  ┌──────────────────────────────────────────┐                       │
│  │   MongoDB Atlas (Cloud Database)         │                       │
│  │   M0 Free Tier (512MB)                   │                       │
│  └──────────────────────────────────────────┘                       │
│                                                                       │
│  Environment Variables:                                              │
│  • PORT=5000                                                         │
│  • MONGODB_URI=mongodb+srv://...                                     │
│  • JWT_SECRET=your_secret_key                                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    FEATURE HIGHLIGHTS                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🔐 AUTHENTICATION                                                    │
│  • JWT-based secure login                                            │
│  • Password hashing with bcrypt                                      │
│  • Persistent sessions (30-day expiry)                               │
│                                                                       │
│  📦 INVENTORY MANAGEMENT                                              │
│  • Full CRUD operations                                              │
│  • Real-time search (name/SKU)                                       │
│  • Low stock highlighting                                            │
│  • Minimum threshold tracking                                        │
│                                                                       │
│  📊 ANALYTICS                                                         │
│  • Live KPI dashboard                                                │
│  • Transaction history                                               │
│  • Usage pattern tracking                                            │
│  • Stock movement visualization                                      │
│                                                                       │
│  🤖 AI PREDICTION (WINNING FEATURE)                                   │
│  • Machine learning-style algorithm                                  │
│  • Analyzes historical usage data                                    │
│  • Predicts stock depletion date                                     │
│  • Color-coded alerts                                                │
│  • Automatic updates                                                 │
│                                                                       │
│  🎨 USER EXPERIENCE                                                   │
│  • Clean industrial design                                           │
│  • Intuitive navigation                                              │
│  • Form validation                                                   │
│  • Error handling                                                    │
│  • Loading states                                                    │
│  • Success feedback                                                  │
│                                                                       │
│  🔒 SECURITY                                                          │
│  • Password hashing                                                  │
│  • JWT token authentication                                          │
│  • Protected API routes                                              │
│  • Input validation                                                  │
│  • CORS configuration                                                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

                        BUILT FOR HACKATHON SUCCESS! 🏆
```
