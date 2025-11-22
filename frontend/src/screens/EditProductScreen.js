import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";

const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await api.getProduct(productId);
      const product = response.data;
      setName(product.name);
      setSku(product.sku);
      setStock(product.stock.toString());
      setMinStock(product.minStock.toString());
    } catch (error) {
      Alert.alert("Error", "Failed to load product");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !sku) {
      Alert.alert("Error", "Name and SKU are required");
      return;
    }

    setSubmitting(true);
    try {
      await api.updateProduct(productId, {
        name,
        sku: sku.toUpperCase(),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 10,
      });

      Alert.alert("Success", "Product updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteProduct(productId);
              Alert.alert("Success", "Product deleted successfully", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
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
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={globalStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.card}>
          <Text style={globalStyles.subtitle}>Edit Product</Text>

          <Text style={globalStyles.label}>Product Name *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter product name"
            value={name}
            onChangeText={setName}
          />

          <Text style={globalStyles.label}>SKU *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter SKU"
            value={sku}
            onChangeText={(text) => setSku(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <Text style={globalStyles.label}>Current Stock</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          <Text style={globalStyles.label}>Minimum Stock Level</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter minimum stock level"
            value={minStock}
            onChangeText={setMinStock}
            keyboardType="numeric"
          />

          <Text style={globalStyles.textMuted}>* Required fields</Text>
        </View>

        <TouchableOpacity
          style={[globalStyles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={globalStyles.buttonText}>
            {submitting ? "Updating..." : "Update Product"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.buttonSecondary}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonSecondaryText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProductScreen;
