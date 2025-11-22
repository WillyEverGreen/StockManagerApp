import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, globalStyles } from "../styles/globalStyles";
import * as api from "../services/api";

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("10");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !sku) {
      Alert.alert("Error", "Name and SKU are required");
      return;
    }

    setLoading(true);
    try {
      await api.createProduct({
        name,
        sku: sku.toUpperCase(),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 10,
      });

      Alert.alert("Success", "Product added successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={globalStyles.subtitle}>Product Information</Text>

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
            placeholder="Enter SKU (e.g., PROD001)"
            value={sku}
            onChangeText={(text) => setSku(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <Text style={globalStyles.label}>Initial Stock</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter initial stock quantity"
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
          style={[globalStyles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? "Adding Product..." : "Add Product"}
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AddProductScreen;
