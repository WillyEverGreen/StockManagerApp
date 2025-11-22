import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.log(
        "History request failed:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const renderItem = ({ item }) => {
    return (
      <View style={globalStyles.card}>
        <View style={globalStyles.spaceBetween}>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.subtitle}>{item.action}</Text>
            <Text style={globalStyles.textMuted}>{item.details}</Text>
            {item.sku && (
              <Text style={globalStyles.textMuted}>SKU: {item.sku}</Text>
            )}
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.userText}>
              👤 {item.user ? item.user.name : "Unknown"}
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

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Audit History</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={globalStyles.listContent}
        ListEmptyComponent={
          <View style={globalStyles.center}>
            <Text style={globalStyles.textMuted}>No history logs found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
  },
  userText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default HistoryScreen;
