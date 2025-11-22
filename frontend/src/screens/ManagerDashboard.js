import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { colors } from "../styles/globalStyles";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_URL = "http://192.168.137.1:5000";

const ManagerDashboard = ({ navigation }) => {
    const { user, signOut } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalWarehouses: 0,
        totalEmployees: 0,
        totalProducts: 0,
        unassignedEmployees: 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [warehouses, employees, products] = await Promise.all([
                axios.get(`${API_URL}/warehouses`, { headers }),
                axios.get(`${API_URL}/employees`, { headers }),
                axios.get(`${API_URL}/products`, { headers }),
            ]);

            const unassigned = employees.data.filter((emp) => !emp.warehouse).length;

            setStats({
                totalWarehouses: warehouses.data.length,
                totalEmployees: employees.data.length,
                totalProducts: products.data.length,
                unassignedEmployees: unassigned,
            });
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#1e40af", "#2563eb", "#3b82f6"]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.name || "Manager"}</Text>
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
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: "#3b82f6" }]}>
                        <Text style={styles.statIcon}>🏢</Text>
                        <Text style={styles.statValue}>{stats.totalWarehouses}</Text>
                        <Text style={styles.statLabel}>Warehouses</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#10b981" }]}>
                        <Text style={styles.statIcon}>👥</Text>
                        <Text style={styles.statValue}>{stats.totalEmployees}</Text>
                        <Text style={styles.statLabel}>Employees</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#f59e0b" }]}>
                        <Text style={styles.statIcon}>📦</Text>
                        <Text style={styles.statValue}>{stats.totalProducts}</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#ef4444" }]}>
                        <Text style={styles.statIcon}>⚠️</Text>
                        <Text style={styles.statValue}>{stats.unassignedEmployees}</Text>
                        <Text style={styles.statLabel}>Unassigned</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("WarehouseManagement")}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#dbeafe" }]}>
                            <Text style={styles.actionEmoji}>🏢</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Manage Warehouses</Text>
                            <Text style={styles.actionSubtitle}>
                                View, add, or edit warehouse locations
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("EmployeeManagement")}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#d1fae5" }]}>
                            <Text style={styles.actionEmoji}>👥</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Manage Employees</Text>
                            <Text style={styles.actionSubtitle}>
                                Assign employees to warehouses
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("Products")}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
                            <Text style={styles.actionEmoji}>📦</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Inventory Management</Text>
                            <Text style={styles.actionSubtitle}>
                                View and manage all products
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("History")}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#e0e7ff" }]}>
                            <Text style={styles.actionEmoji}>📊</Text>
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Activity Reports</Text>
                            <Text style={styles.actionSubtitle}>
                                View all system activity logs
                            </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>
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
        alignItems: "center",
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
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        width: (width - 52) / 2,
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

export default ManagerDashboard;
