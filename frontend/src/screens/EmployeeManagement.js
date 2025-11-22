import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
    Modal,
} from "react-native";
import { colors } from "../styles/globalStyles";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.137.1:5000";

const EmployeeManagement = ({ navigation }) => {
    const [employees, setEmployees] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [employeesRes, warehousesRes] = await Promise.all([
                axios.get(`${API_URL}/employees`, { headers }),
                axios.get(`${API_URL}/warehouses`, { headers }),
            ]);

            setEmployees(employeesRes.data);
            setWarehouses(warehousesRes.data);
        } catch (error) {
            Alert.alert("Error", "Failed to load data");
        }
    };

    const handleAssignEmployee = async () => {
        if (!selectedEmployee || !selectedWarehouse) {
            Alert.alert("Error", "Please select a warehouse");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            await axios.post(
                `${API_URL}/employees/assign`,
                {
                    employeeId: selectedEmployee._id,
                    warehouseId: selectedWarehouse,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert("Success", "Employee assigned successfully");
            setModalVisible(false);
            setSelectedEmployee(null);
            setSelectedWarehouse("");
            loadData();
        } catch (error) {
            console.error("Assign Employee Error:", error);
            if (error.response) {
                console.error("Error Data:", error.response.data);
                console.error("Error Status:", error.response.status);
            } else if (error.request) {
                console.error("Error Request:", error.request);
            } else {
                console.error("Error Message:", error.message);
            }
            Alert.alert("Error", error.response?.data?.message || "Failed to assign employee");
        }
    };

    const handleUnassignEmployee = (employee) => {
        Alert.alert(
            "Unassign Employee",
            `Remove ${employee.name} from ${employee.warehouse?.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unassign",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            await axios.post(
                                `${API_URL}/employees/unassign/${employee._id}`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            Alert.alert("Success", "Employee unassigned");
                            loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to unassign employee");
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const unassignedEmployees = employees.filter((emp) => !emp.warehouse);
    const assignedEmployees = employees.filter((emp) => emp.warehouse);

    const getSelectedWarehouseName = () => {
        const warehouse = warehouses.find((w) => w._id === selectedWarehouse);
        return warehouse ? warehouse.name : "Select a warehouse...";
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Employee Management</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Unassigned Employees */}
                {unassignedEmployees.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Unassigned ({unassignedEmployees.length})
                            </Text>
                        </View>
                        {unassignedEmployees.map((employee) => (
                            <View key={employee._id} style={styles.employeeCard}>
                                <View style={styles.employeeIcon}>
                                    <Text style={styles.iconText}>👤</Text>
                                </View>
                                <View style={styles.employeeInfo}>
                                    <Text style={styles.employeeName}>{employee.name}</Text>
                                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                                    <View style={styles.unassignedBadge}>
                                        <Text style={styles.unassignedText}>Not Assigned</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.assignButton}
                                    onPress={() => {
                                        setSelectedEmployee(employee);
                                        setModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.assignButtonText}>Assign</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Assigned Employees */}
                {assignedEmployees.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Assigned ({assignedEmployees.length})
                            </Text>
                        </View>
                        {assignedEmployees.map((employee) => (
                            <View key={employee._id} style={styles.employeeCard}>
                                <View style={styles.employeeIcon}>
                                    <Text style={styles.iconText}>👤</Text>
                                </View>
                                <View style={styles.employeeInfo}>
                                    <Text style={styles.employeeName}>{employee.name}</Text>
                                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                                    <View style={styles.warehouseBadge}>
                                        <Text style={styles.warehouseBadgeText}>
                                            🏢 {employee.warehouse?.name}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.unassignButton}
                                    onPress={() => handleUnassignEmployee(employee)}
                                >
                                    <Text style={styles.unassignButtonText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {employees.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>No Employees Yet</Text>
                        <Text style={styles.emptyText}>
                            Employees will appear here after they sign up
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Assign Employee Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assign Employee</Text>

                        {selectedEmployee && (
                            <View style={styles.employeePreview}>
                                <Text style={styles.previewLabel}>Employee:</Text>
                                <Text style={styles.previewValue}>{selectedEmployee.name}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Select Warehouse</Text>

                        {/* Custom Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownPlaceholder}>
                                {getSelectedWarehouseName()}
                            </Text>
                        </View>

                        <ScrollView style={styles.warehouseList}>
                            {warehouses.map((warehouse) => (
                                <TouchableOpacity
                                    key={warehouse._id}
                                    style={[
                                        styles.warehouseOption,
                                        selectedWarehouse === warehouse._id && styles.warehouseOptionSelected,
                                    ]}
                                    onPress={() => setSelectedWarehouse(warehouse._id)}
                                >
                                    <Text
                                        style={[
                                            styles.warehouseOptionText,
                                            selectedWarehouse === warehouse._id && styles.warehouseOptionTextSelected,
                                        ]}
                                    >
                                        {warehouse.name}
                                    </Text>
                                    {selectedWarehouse === warehouse._id && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setSelectedEmployee(null);
                                    setSelectedWarehouse("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.createButton]}
                                onPress={handleAssignEmployee}
                            >
                                <Text style={styles.createButtonText}>Assign</Text>
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
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gray900,
    },
    employeeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    employeeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.gray100,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray900,
        marginBottom: 4,
    },
    employeeEmail: {
        fontSize: 13,
        color: colors.gray600,
        marginBottom: 6,
    },
    unassignedBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    unassignedText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#991b1b",
    },
    warehouseBadge: {
        backgroundColor: "#dbeafe",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    warehouseBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1e40af",
    },
    assignButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    assignButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    unassignButton: {
        backgroundColor: colors.danger,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    unassignButtonText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
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
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.gray900,
        marginBottom: 20,
        textAlign: "center",
    },
    employeePreview: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    previewLabel: {
        fontSize: 12,
        color: colors.gray600,
        marginBottom: 4,
    },
    previewValue: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.gray900,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
        marginBottom: 8,
    },
    dropdownContainer: {
        backgroundColor: colors.gray50,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: colors.gray700,
    },
    warehouseList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    warehouseOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: colors.gray50,
    },
    warehouseOptionSelected: {
        backgroundColor: colors.primary,
    },
    warehouseOptionText: {
        fontSize: 15,
        color: colors.gray900,
        fontWeight: "500",
    },
    warehouseOptionTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    checkmark: {
        fontSize: 18,
        color: colors.white,
        fontWeight: "bold",
    },
    modalActions: {
        flexDirection: "row",
        marginTop: 8,
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

export default EmployeeManagement;
