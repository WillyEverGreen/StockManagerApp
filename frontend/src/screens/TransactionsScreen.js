import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const TransactionsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'in', 'out'

  const loadTransactions = async () => {
    // Check if employee has warehouse assignment
    if (user?.role === "worker" && !user?.warehouse) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await api.getTransactions(100);
      setTransactions(response.data);
    } catch (error) {
      console.error("Load transactions error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const renderTransaction = ({ item }) => {
    const isStockIn = item.type === "in";

    return (
      <View style={globalStyles.card}>
        <View style={globalStyles.spaceBetween}>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.subtitle}>{item.productName}</Text>
            <Text style={globalStyles.textMuted}>SKU: {item.productSku}</Text>
            <Text style={globalStyles.textMuted}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={[
                styles.typeBadge,
                isStockIn ? styles.typeBadgeIn : styles.typeBadgeOut,
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {isStockIn ? "📥 IN" : "📤 OUT"}
              </Text>
            </View>
            <Text
              style={[
                styles.quantityText,
                isStockIn ? styles.quantityIn : styles.quantityOut,
              ]}
            >
              {isStockIn ? "+" : "-"}
              {item.quantity}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show empty state for unassigned employees
  if (user?.role === "worker" && !user?.warehouse) {
    return (
      <View style={globalStyles.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={globalStyles.subtitle}>No Warehouse Assigned</Text>
        <Text style={[globalStyles.textMuted, { textAlign: "center", marginTop: 8, paddingHorizontal: 32 }]}>
          You cannot view transactions until you are assigned to a warehouse.
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "all" && styles.filterTabTextActive,
            ]}
          >
            All ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === "in" && styles.filterTabActive]}
          onPress={() => setFilter("in")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "in" && styles.filterTabTextActive,
            ]}
          >
            📥 In ({transactions.filter((t) => t.type === "in").length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === "out" && styles.filterTabActive]}
          onPress={() => setFilter("out")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "out" && styles.filterTabTextActive,
            ]}
          >
            📤 Out ({transactions.filter((t) => t.type === "out").length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={globalStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={globalStyles.card}>
            <Text style={globalStyles.textMuted}>No transactions found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: "600",
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
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityIn: {
    color: colors.success,
  },
  quantityOut: {
    color: colors.warning,
  },
});

export default TransactionsScreen;
