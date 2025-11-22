# Stock Manager App

A full-stack inventory management application with Role-Based Access Control (RBAC).

## 🚀 Features
- **Role-Based Access**: Separate dashboards for Managers and Employees.
- **Warehouse Management**: Create, update, and manage multiple warehouses.
- **Employee Management**: Assign employees to specific warehouses.
- **Inventory Tracking**: Real-time stock levels, low stock alerts, and transaction history.
- **Secure Auth**: JWT-based authentication with session management.

---

## 🛠️ Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.
- A mobile device or simulator (Android/iOS) with [Expo Go](https://expo.dev/client) installed.

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    - Copy the example file to create your local config:
      ```bash
      cp .env.example .env
      # On Windows Command Prompt: copy .env.example .env
      ```
    - Open `.env` and verify the settings (default is usually fine for local dev):
      ```env
      PORT=5000
      MONGO_URI=mongodb://localhost:27017/stockmanager
      JWT_SECRET=your_secret_key
      ```

4.  **Seed the Database** (Optional but recommended):
    - This creates default manager accounts and warehouses.
    ```bash
    node seedManagers.js
    ```
    - *Default Manager Login:* `manager1@example.com` / `manager123`

5.  Start the server:
    ```bash
    npm run dev
    ```
    - You should see: `Server running on port 5000` and `MongoDB Connected`.

---

### 2. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **⚠️ IMPORTANT: Configure API URL**
    - Open `src/config.js`.
    - Find the `IP_ADDRESS` variable.
    - Change it to **YOUR computer's local IP address**.
      - *Windows:* Run `ipconfig` in terminal and look for "IPv4 Address".
      - *Mac/Linux:* Run `ifconfig`.
    
    ```javascript
    // src/config.js
    const IP_ADDRESS = "192.168.1.5"; // <--- REPLACE THIS with your IP
    ```
    - *Note: If using an Android Emulator, you can try `10.0.2.2`, but your LAN IP is recommended for physical devices.*

4.  Start the app:
    ```bash
    npx expo start --clear
    ```

5.  **Run on Device**:
    - Scan the QR code with the **Expo Go** app on your phone.
    - Ensure your phone and computer are on the **same Wi-Fi network**.

---

## 📱 Usage Guide

### Manager
- **Login**: Use the seeded credentials (e.g., `manager1@example.com`).
- **Actions**: Create warehouses, add employees, assign employees to warehouses, manage global inventory.

### Employee
- **Sign Up**: Create a new account via the app.
- **Status**: Initially, you will see "No Warehouse Assigned".
- **Assignment**: A Manager must login and assign you to a warehouse.
- **Actions**: Once assigned, pull-to-refresh your dashboard to see inventory and perform stock operations.
