import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { colors } from "../styles/globalStyles";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.137.1:5000";

const EmployeeDashboard = ({ navigation }) => {
    const { user, signOut } = useContext(AuthContext);
    const [warehouse, setWarehouse] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockItems: 0,
        recentActivity: [],
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Check if employee has warehouse assignment
            if (!user?.warehouse) {
                Alert.alert(
                    "No Warehouse Assigned",
                    "You have not been assigned to a warehouse yet. Please contact your manager."
                );
                return;
            }

            // Load warehouse inventory
            const response = await axios.get(
                `${API_URL}/warehouses/${user.warehouse._id}/inventory`,
                { headers }
            );

            setWarehouse(user.warehouse);
            setStats({
                totalProducts: response.data.stats.totalItems,
                lowStockItems: response.data.stats.lowStockItems,
                recentActivity: [],
            });
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            Alert.alert("Error", "Failed to load dashboard data");
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#10b981", "#059669", "#047857"]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>{user?.name || "Employee"}</Text>
                        {warehouse && (
                            <View style={styles.warehouseBadge}>
                                <Text style={styles.warehouseIcon}>🏢</Text>
                                <Text style={styles.warehouseName}>{warehouse.name}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {!warehouse ? (
                    <View style={styles.noWarehouseCard}>
                        <Text style={styles.noWarehouseIcon}>⚠️</Text>
                        <Text style={styles.noWarehouseTitle}>No Warehouse Assigned</Text>
                        <Text style={styles.noWarehouseText}>
                            You haven't been assigned to a warehouse yet. Please contact your
                            manager to get started.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: "#3b82f6" }]}>
                                <Text style={styles.statIcon}>📦</Text>
                                <Text style={styles.statValue}>{stats.totalProducts}</Text>
                                <Text style={styles.statLabel}>Total Items</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: "#ef4444" }]}>
                                <Text style={styles.statIcon}>⚠️</Text>
                                <Text style={styles.statValue}>{stats.lowStockItems}</Text>
                                <Text style={styles.statLabel}>Low Stock</Text>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("Products")}
                            >
                                <View
                                    style={[styles.actionIcon, { backgroundColor: "#dbeafe" }]}
                                >
                                    <Text style={styles.actionEmoji}>📋</Text>
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>View Inventory</Text>
                                    <Text style={styles.actionSubtitle}>
                                        See all products in your warehouse
                                    </Text>
                                </View>
                                <Text style={styles.actionArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("StockIn")}
                            >
                                <View
                                    style={[styles.actionIcon, { backgroundColor: "#d1fae5" }]}
                                >
                                    <Text style={styles.actionEmoji}>📥</Text>
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Add Stock</Text>
                                    <Text style={styles.actionSubtitle}>
                                        Record incoming inventory
                                    </Text>
                                </View>
                                <Text style={styles.actionArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("StockOut")}
                            >
                                <View
                                    style={[styles.actionIcon, { backgroundColor: "#fee2e2" }]}
                                >
                                    <Text style={styles.actionEmoji}>📤</Text>
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Remove Stock</Text>
                                    <Text style={styles.actionSubtitle}>
                                        Record outgoing inventory
                                    </Text>
                                </View>
                                <Text style={styles.actionArrow}>›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("Transactions")}
                            >
                                <View
                                    style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}
                                >
                                    <Text style={styles.actionEmoji}>📊</Text>
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Transaction History</Text>
                                    <Text style={styles.actionSubtitle}>
                                        View your recent activity
                                    </Text>
                                </View>
                                <Text style={styles.actionArrow}>›</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray100,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    greeting: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "500",
    },
    userName: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.white,
        marginTop: 4,
        marginBottom: 12,
    },
    warehouseBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    warehouseIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    warehouseName: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 13,
    },
    logoutButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    logoutText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    noWarehouseCard: {
        backgroundColor: colors.white,
        padding: 32,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    noWarehouseIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    noWarehouseTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.gray900,
        marginBottom: 8,
        textAlign: "center",
    },
    noWarehouseText: {
        fontSize: 14,
        color: colors.gray600,
        textAlign: "center",
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.gray900,
        marginBottom: 16,
    },
    actionCard: {
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
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray900,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: colors.gray600,
    },
    actionArrow: {
        fontSize: 28,
        color: colors.gray400,
        fontWeight: "300",
    },
});

export default EmployeeDashboard;
