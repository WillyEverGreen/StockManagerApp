import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";
import {
  calculateStockPrediction,
  getPredictionStatus,
  isLowStock,
} from "../utils/prediction";

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, []);

  const loadProductDetails = async () => {
    try {
      const [productRes, transactionsRes] = await Promise.all([
        api.getProduct(productId),
        api.getProductTransactions(productId),
      ]);

      setProduct(productRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load product details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const prediction = calculateStockPrediction(
    product.stock,
    product.usageHistory
  );
  const predictionStatus = getPredictionStatus(prediction.predictedDays);
  const lowStock = isLowStock(product.stock, product.minStock);

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.scrollContent}>
        {/* Product Info */}
        <View style={globalStyles.card}>
          <Text style={globalStyles.title}>{product.name}</Text>
          <Text style={globalStyles.textMuted}>SKU: {product.sku}</Text>

          <View style={styles.divider} />

          <View style={globalStyles.spaceBetween}>
            <Text style={globalStyles.text}>Current Stock</Text>
            <Text style={[styles.stockValue, lowStock && styles.lowStockValue]}>
              {product.stock} units
            </Text>
          </View>

          <View style={globalStyles.spaceBetween}>
            <Text style={globalStyles.text}>Minimum Stock</Text>
            <Text style={globalStyles.text}>{product.minStock} units</Text>
          </View>

          {lowStock && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ Stock is below minimum level!
              </Text>
            </View>
          )}
        </View>

        {/* AI Prediction Card */}
        <View style={[globalStyles.card, styles.predictionCard]}>
          <Text style={styles.predictionTitle}>🤖 AI Stock Prediction</Text>

          {prediction.hasData && prediction.predictedDays !== null ? (
            <>
              <View style={styles.predictionMain}>
                <Text style={styles.predictionDays}>
                  {prediction.predictedDays}
                </Text>
                <Text style={styles.predictionLabel}>days remaining</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: predictionStatus.color + "20" },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: predictionStatus.color }]}
                >
                  {predictionStatus.label}
                </Text>
              </View>

              <Text style={globalStyles.textMuted}>
                Average daily usage: {prediction.averageDailyUsage} units
              </Text>
            </>
          ) : (
            <Text style={globalStyles.textMuted}>{prediction.message}</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("EditProduct", { productId: product._id })
            }
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("StockIn")}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.actionText}>Stock In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("StockOut")}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Stock Out</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <Text style={globalStyles.subtitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={globalStyles.card}>
            <Text style={globalStyles.textMuted}>No transactions yet</Text>
          </View>
        ) : (
          transactions.slice(0, 10).map((transaction) => (
            <View key={transaction._id} style={globalStyles.card}>
              <View style={globalStyles.spaceBetween}>
                <View>
                  <Text style={globalStyles.subtitle}>
                    {transaction.type === "in" ? "📥 Stock In" : "📤 Stock Out"}
                  </Text>
                  <Text style={globalStyles.textMuted}>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionQty,
                    transaction.type === "in" ? styles.qtyIn : styles.qtyOut,
                  ]}
                >
                  {transaction.type === "in" ? "+" : "-"}
                  {transaction.quantity}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 12,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray900,
  },
  lowStockValue: {
    color: colors.danger,
  },
  warningBanner: {
    backgroundColor: colors.danger + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    color: colors.danger,
    fontWeight: "600",
    textAlign: "center",
  },
  predictionCard: {
    backgroundColor: colors.primary + "10",
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray900,
    marginBottom: 16,
  },
  predictionMain: {
    alignItems: "center",
    marginBottom: 12,
  },
  predictionDays: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.primary,
  },
  predictionLabel: {
    fontSize: 16,
    color: colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    ...globalStyles.shadow,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray700,
  },
  transactionQty: {
    fontSize: 18,
    fontWeight: "bold",
  },
  qtyIn: {
    color: colors.success,
  },
  qtyOut: {
    color: colors.warning,
  },
});

export default ProductDetailScreen;
