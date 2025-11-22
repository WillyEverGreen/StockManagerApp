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
import { Picker } from "@react-native-picker/picker";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";

const StockInScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert("Error", "Please select a product");
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    setSubmitting(true);
    try {
      await api.stockIn({
        productId: selectedProductId,
        quantity: qty,
      });

      Alert.alert("Success", "Stock added successfully", [
        {
          text: "OK",
          onPress: () => {
            setQuantity("");
            setSelectedProductId("");
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add stock"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

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
          <Text style={globalStyles.title}>📥 Stock In</Text>
          <Text style={globalStyles.textMuted}>
            Add incoming stock to inventory
          </Text>
        </View>

        <View style={globalStyles.card}>
          <Text style={globalStyles.label}>Select Product *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProductId}
              onValueChange={setSelectedProductId}
              style={styles.picker}
            >
              <Picker.Item label="-- Select a product --" value="" />
              {products.map((product) => (
                <Picker.Item
                  key={product._id}
                  label={`${product.name} (${product.sku})`}
                  value={product._id}
                />
              ))}
            </Picker>
          </View>

          {selectedProduct && (
            <View style={styles.productInfo}>
              <Text style={globalStyles.text}>
                Current Stock: {selectedProduct.stock} units
              </Text>
              <Text style={globalStyles.textMuted}>
                SKU: {selectedProduct.sku}
              </Text>
            </View>
          )}

          <Text style={globalStyles.label}>Quantity *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter quantity to add"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {selectedProduct && quantity && parseInt(quantity) > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>New Stock Level:</Text>
              <Text style={styles.previewValue}>
                {selectedProduct.stock + parseInt(quantity)} units
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[globalStyles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={globalStyles.buttonText}>
            {submitting ? "Processing..." : "Add Stock"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.buttonSecondary}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonSecondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  productInfo: {
    backgroundColor: colors.gray100,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: colors.success + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.success,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default StockInScreen;
