import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    RefreshControl,
    Modal,
} from "react-native";
import { colors } from "../styles/globalStyles";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.137.1:5000";

const WarehouseManagement = ({ navigation }) => {
    const [warehouses, setWarehouses] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        capacity: "",
    });

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get(`${API_URL}/warehouses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWarehouses(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to load warehouses");
        }
    };

    const handleCreateWarehouse = async () => {
        if (!formData.name || !formData.location) {
            Alert.alert("Error", "Name and location are required");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const user = JSON.parse(await AsyncStorage.getItem("user"));

            await axios.post(
                `${API_URL}/warehouses`,
                {
                    ...formData,
                    manager: user.id,
                    capacity: parseInt(formData.capacity) || 0,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert("Success", "Warehouse created successfully");
            setModalVisible(false);
            setFormData({ name: "", location: "", capacity: "" });
            loadWarehouses();
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to create warehouse");
        }
    };

    const handleDeleteWarehouse = (id, name) => {
        Alert.alert(
            "Delete Warehouse",
            `Are you sure you want to delete ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            await axios.delete(`${API_URL}/warehouses/${id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            Alert.alert("Success", "Warehouse deleted");
                            loadWarehouses();
                        } catch (error) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to delete warehouse");
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadWarehouses();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Warehouse Management</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButton}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {warehouses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🏢</Text>
                        <Text style={styles.emptyTitle}>No Warehouses Yet</Text>
                        <Text style={styles.emptyText}>
                            Create your first warehouse to get started
                        </Text>
                    </View>
                ) : (
                    warehouses.map((warehouse) => (
                        <View key={warehouse._id} style={styles.warehouseCard}>
                            <View style={styles.warehouseHeader}>
                                <View style={styles.warehouseIcon}>
                                    <Text style={styles.iconText}>🏢</Text>
                                </View>
                                <View style={styles.warehouseInfo}>
                                    <Text style={styles.warehouseName}>{warehouse.name}</Text>
                                    <Text style={styles.warehouseLocation}>
                                        📍 {warehouse.location}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.warehouseDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Manager:</Text>
                                    <Text style={styles.detailValue}>
                                        {warehouse.manager?.name || "Unassigned"}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Capacity:</Text>
                                    <Text style={styles.detailValue}>
                                        {warehouse.capacity || "N/A"}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Status:</Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor: warehouse.isActive
                                                    ? "#d1fae5"
                                                    : "#fee2e2",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color: warehouse.isActive ? "#065f46" : "#991b1b",
                                                },
                                            ]}
                                        >
                                            {warehouse.isActive ? "Active" : "Inactive"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.warehouseActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() =>
                                        handleDeleteWarehouse(warehouse._id, warehouse.name)
                                    }
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Create Warehouse Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Warehouse</Text>

                        <Text style={styles.label}>Warehouse Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Main Warehouse"
                            value={formData.name}
                            onChangeText={(text) =>
                                setFormData({ ...formData, name: text })
                            }
                        />

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 123 Main St, City"
                            value={formData.location}
                            onChangeText={(text) =>
                                setFormData({ ...formData, location: text })
                            }
                        />

                        <Text style={styles.label}>Capacity (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 10000"
                            keyboardType="numeric"
                            value={formData.capacity}
                            onChangeText={(text) =>
                                setFormData({ ...formData, capacity: text })
                            }
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setFormData({ name: "", location: "", capacity: "" });
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.createButton]}
                                onPress={handleCreateWarehouse}
                            >
                                <Text style={styles.createButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray100,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    backButton: {
        fontSize: 32,
        color: colors.primary,
        fontWeight: "300",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gray900,
    },
    addButton: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.gray900,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.gray600,
        textAlign: "center",
    },
    warehouseCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    warehouseHeader: {
        flexDirection: "row",
        marginBottom: 16,
    },
    warehouseIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.gray100,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    warehouseInfo: {
        flex: 1,
    },
    warehouseName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gray900,
        marginBottom: 4,
    },
    warehouseLocation: {
        fontSize: 14,
        color: colors.gray600,
    },
    warehouseDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.gray600,
        fontWeight: "500",
    },
    detailValue: {
        fontSize: 14,
        color: colors.gray900,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    warehouseActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: colors.danger,
    },
    deleteButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: "85%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.gray900,
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: colors.gray50,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.gray900,
    },
    modalActions: {
        flexDirection: "row",
        marginTop: 24,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: colors.gray200,
    },
    cancelButtonText: {
        color: colors.gray700,
        fontWeight: "600",
        fontSize: 16,
    },
    createButton: {
        backgroundColor: colors.primary,
    },
    createButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default WarehouseManagement;
