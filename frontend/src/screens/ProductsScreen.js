import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Button,
} from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from "@react-navigation/native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";
import { isLowStock, calculateStockPrediction } from "../utils/prediction";

const ProductsScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProducts = async () => {
    try {
      const response = await api.getProducts(searchQuery);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Load products error:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(text.toLowerCase()) ||
          p.sku.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    setIsScanning(false);
    setSearchQuery(data);
    handleSearch(data);
    Alert.alert("Scanned", `Found code: ${data}`);
  };

  const renderProduct = ({ item }) => {
    const lowStock = isLowStock(item.stock, item.minStock);
    const prediction = calculateStockPrediction(item.stock, item.usageHistory);

    return (
      <TouchableOpacity
        style={[globalStyles.card, lowStock && styles.lowStockCard]}
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item._id })
        }
      >
        <View style={globalStyles.spaceBetween}>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.subtitle}>{item.name}</Text>
            <Text style={globalStyles.textMuted}>SKU: {item.sku}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.stockText, lowStock && styles.lowStockText]}>
              {item.stock} units
            </Text>
            {lowStock && (
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockBadgeText}>⚠️ Low Stock</Text>
              </View>
            )}
          </View>
        </View>

        {prediction.hasData && prediction.predictedDays !== null && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionText}>🤖 {prediction.message}</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("EditProduct", { productId: item._id });
            }}
          >
            <Text style={styles.actionButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or SKU..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (!permission?.granted) requestPermission();
            setIsScanning(true);
          }}
        >
          <Text style={{ fontSize: 20 }}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={globalStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={globalStyles.card}>
            <Text style={globalStyles.textMuted}>No products found</Text>
          </View>
        }
      />

      <Modal visible={isScanning} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "code128",
                "code39",
              ],
            }}
          />
          <Button title="Cancel Scan" onPress={() => setIsScanning(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginRight: 8,
    backgroundColor: colors.gray100,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  stockText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray900,
    marginBottom: 4,
  },
  lowStockText: {
    color: colors.danger,
  },
  lowStockBadge: {
    backgroundColor: colors.danger + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.danger,
  },
  predictionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.gray100,
    borderRadius: 6,
  },
  predictionText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  actionButton: {
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default ProductsScreen;
