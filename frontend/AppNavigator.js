import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AuthContext } from "./src/context/AuthContext";
import { colors } from "./src/styles/globalStyles";

// Auth Screens
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";

// Dashboard Screens
import ManagerDashboard from "./src/screens/ManagerDashboard";
import EmployeeDashboard from "./src/screens/EmployeeDashboard";

// Main Screens
import DashboardScreen from "./src/screens/DashboardScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import AddProductScreen from "./src/screens/AddProductScreen";
import EditProductScreen from "./src/screens/EditProductScreen";
import StockInScreen from "./src/screens/StockInScreen";
import StockOutScreen from "./src/screens/StockOutScreen";
import TransactionsScreen from "./src/screens/TransactionsScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

// Management Screens (Manager only)
import WarehouseManagement from "./src/screens/WarehouseManagement";
import EmployeeManagement from "./src/screens/EmployeeManagement";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for Managers
const ManagerTabs = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ManagerDashboard}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Bottom Tab Navigator for Employees
const EmployeeTabs = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={EmployeeDashboard}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

// Main Stack Navigator
const MainStack = () => {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === "manager";

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={isManager ? ManagerTabs : EmployeeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Details" }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: "Add Product" }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: "Edit Product" }}
      />
      <Stack.Screen
        name="StockIn"
        component={StockInScreen}
        options={{ title: "Stock In" }}
      />
      <Stack.Screen
        name="StockOut"
        component={StockOutScreen}
        options={{ title: "Stock Out" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "Audit History" }}
      />
      {/* Manager-only screens */}
      {isManager && (
        <>
          <Stack.Screen
            name="WarehouseManagement"
            component={WarehouseManagement}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EmployeeManagement"
            component={EmployeeManagement}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  logoutText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AppNavigator;
