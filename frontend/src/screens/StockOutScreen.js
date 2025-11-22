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
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";

const StockOutScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    const product = products.find((p) => p.sku === data || p._id === data);

    if (product) {
      setSelectedProductId(product._id);
      Alert.alert("Product Found", `${product.name} (${product.sku})`);
    } else {
      Alert.alert("Not Found", `No product found with SKU/ID: ${data}`);
    }
  };

  const startScan = async () => {
    if (!permission) {
      await requestPermission();
    }
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Camera permission is required to scan QR codes"
        );
        return;
      }
    }
    setScanning(true);
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

    const product = products.find((p) => p._id === selectedProductId);
    if (qty > product.stock) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${product.stock} units available`
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.stockOut({
        productId: selectedProductId,
        quantity: qty,
      });

      Alert.alert("Success", "Stock removed successfully", [
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
        error.response?.data?.message || "Failed to remove stock"
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

  if (scanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_e", "code128"],
          }}
        />
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setScanning(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
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
          <View style={globalStyles.spaceBetween}>
            <Text style={globalStyles.title}>📤 Stock Out</Text>
            <TouchableOpacity onPress={startScan} style={styles.scanButton}>
              <Text style={styles.scanButtonText}>📷 Scan QR</Text>
            </TouchableOpacity>
          </View>
          <Text style={globalStyles.textMuted}>
            Remove outgoing stock from inventory
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
                  label={`${product.name} (${product.sku}) - ${product.stock} units`}
                  value={product._id}
                />
              ))}
            </Picker>
          </View>

          {selectedProduct && (
            <View style={styles.productInfo}>
              <Text style={globalStyles.text}>
                Available Stock: {selectedProduct.stock} units
              </Text>
              <Text style={globalStyles.textMuted}>
                SKU: {selectedProduct.sku}
              </Text>
              {selectedProduct.stock === 0 && (
                <Text style={styles.warningText}>⚠️ No stock available</Text>
              )}
            </View>
          )}

          <Text style={globalStyles.label}>Quantity *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter quantity to remove"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            editable={selectedProduct && selectedProduct.stock > 0}
          />

          {selectedProduct && quantity && parseInt(quantity) > 0 && (
            <View
              style={[
                styles.previewBox,
                parseInt(quantity) > selectedProduct.stock &&
                  styles.previewBoxError,
              ]}
            >
              <Text style={styles.previewLabel}>New Stock Level:</Text>
              <Text
                style={[
                  styles.previewValue,
                  parseInt(quantity) > selectedProduct.stock &&
                    styles.previewValueError,
                ]}
              >
                {selectedProduct.stock - parseInt(quantity)} units
              </Text>
              {parseInt(quantity) > selectedProduct.stock && (
                <Text style={styles.errorText}>Insufficient stock!</Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            globalStyles.button,
            (submitting || !selectedProduct || selectedProduct.stock === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            submitting || !selectedProduct || selectedProduct.stock === 0
          }
        >
          <Text style={globalStyles.buttonText}>
            {submitting ? "Processing..." : "Remove Stock"}
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
  warningText: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: 4,
  },
  previewBox: {
    backgroundColor: colors.warning + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  previewBoxError: {
    backgroundColor: colors.danger + "20",
  },
  previewLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.warning,
  },
  previewValueError: {
    color: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: 4,
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  scanButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scanButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    padding: 20,
  },
  cancelButton: {
    backgroundColor: colors.danger,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StockOutScreen;
