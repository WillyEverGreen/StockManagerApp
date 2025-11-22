import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";
import { isLowStock } from "../utils/prediction";

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [productsRes, transactionsRes] = await Promise.all([
        api.getProducts(),
        api.getTransactions(10),
      ]);

      const products = productsRes.data;

      // Calculate stats
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const lowStockCount = products.filter((p) =>
        isLowStock(p.stock, p.minStock)
      ).length;

      setStats({ totalProducts, totalStock, lowStockCount });
      setRecentTransactions(transactionsRes.data);

      // Calculate predictions (Manager only)
      if (user?.role === "manager") {
        const predicted = products
          .filter((p) => p.usageHistory && p.usageHistory.length > 0)
          .map((p) => {
            const avgUsage =
              p.usageHistory.reduce((a, b) => a + b, 0) / p.usageHistory.length;
            const daysLeft = avgUsage > 0 ? p.stock / avgUsage : 999;
            return { ...p, daysLeft };
          })
          .filter((p) => p.daysLeft < 7) // Run out in 7 days
          .sort((a, b) => a.daysLeft - b.daysLeft);
        setPredictions(predicted);
      }
    } catch (error) {
      console.log(
        "Dashboard request failed:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={globalStyles.scrollContent}>
        <Text style={globalStyles.title}>Dashboard</Text>
        <Text style={globalStyles.textMuted}>
          Welcome, {user?.name} ({user?.role})
        </Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[globalStyles.card, styles.statCard]}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>

          <View style={[globalStyles.card, styles.statCard]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.totalStock}</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </View>

          <View style={[globalStyles.card, styles.statCard]}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={[styles.statValue, styles.statDanger]}>
              {stats.lowStockCount}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Manager Predictions */}
        {user?.role === "manager" && predictions.length > 0 && (
          <View>
            <Text style={[globalStyles.subtitle, { marginTop: 16 }]}>
              ⚠️ Stock Predictions
            </Text>
            {predictions.map((p) => (
              <View
                key={p._id}
                style={[globalStyles.card, styles.predictionCard]}
              >
                <Text style={styles.predictionText}>
                  {p.name} will run out in ~{Math.ceil(p.daysLeft)} transactions
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[globalStyles.subtitle, { marginTop: 16 }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate("AddProduct")}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate("StockIn")}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.actionText}>Stock In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate("StockOut")}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Stock Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => navigation.navigate("History")}
          >
            <Text style={styles.actionIcon}>📜</Text>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <Text style={[globalStyles.subtitle, { marginTop: 16 }]}>
          Recent Transactions
        </Text>
        {recentTransactions.length === 0 ? (
          <View style={globalStyles.card}>
            <Text style={globalStyles.textMuted}>No transactions yet</Text>
          </View>
        ) : (
          recentTransactions.slice(0, 5).map((transaction) => (
            <View key={transaction._id} style={globalStyles.card}>
              <View style={globalStyles.spaceBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.subtitle}>
                    {transaction.productName}
                  </Text>
                  <Text style={globalStyles.textMuted}>
                    {transaction.productSku}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={[
                      styles.typeBadge,
                      transaction.type === "in"
                        ? styles.typeBadgeIn
                        : styles.typeBadgeOut,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {transaction.type === "in" ? "📥" : "📤"}{" "}
                      {transaction.quantity}
                    </Text>
                  </View>
                  <Text style={globalStyles.textMuted}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {recentTransactions.length > 0 && (
          <TouchableOpacity
            style={globalStyles.buttonSecondary}
            onPress={() => navigation.navigate("Transactions")}
          >
            <Text style={globalStyles.buttonSecondaryText}>
              View All Transactions
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray900,
    marginBottom: 4,
  },
  statDanger: {
    color: colors.danger,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    paddingVertical: 20,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray700,
    textAlign: "center",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  typeBadgeIn: {
    backgroundColor: colors.success + "20",
  },
  typeBadgeOut: {
    backgroundColor: colors.warning + "20",
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray900,
  },
  predictionCard: {
    backgroundColor: colors.warning + "10",
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 8,
  },
  predictionText: {
    color: colors.gray900,
    fontWeight: "600",
  },
});

export default DashboardScreen;
