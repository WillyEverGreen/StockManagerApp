import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { colors, globalStyles } from "../styles/globalStyles";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("manager"); // 'manager' or 'employee'

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password, selectedTab);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Login Failed", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#1e40af", "#2563eb", "#3b82f6"]}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📦</Text>
          </View>
          <Text style={styles.title}>Stock Manager</Text>
          <Text style={styles.subtitle}>Inventory made simple</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "manager" && styles.tabActive,
              ]}
              onPress={() => setSelectedTab("manager")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "manager" && styles.tabTextActive,
                ]}
              >
                👔 Manager
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "employee" && styles.tabActive,
              ]}
              onPress={() => setSelectedTab("employee")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "employee" && styles.tabTextActive,
                ]}
              >
                👷 Employee
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabIndicator}>
            <View
              style={[
                styles.indicator,
                selectedTab === "employee" && styles.indicatorRight,
              ]}
            />
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.welcomeText}>
              Welcome back, {selectedTab === "manager" ? "Manager" : "Team Member"}!
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧 Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#2563eb", "#1e40af"]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Signing in..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⚡</Text>
            <Text style={styles.infoTitle}>Real-time Updates</Text>
            <Text style={styles.infoText}>Track inventory changes instantly</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoTitle}>Smart Analytics</Text>
            <Text style={styles.infoText}>Make data-driven decisions</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  gradientHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: -20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray500,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    height: 3,
    backgroundColor: colors.gray100,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
    width: "50%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  indicatorRight: {
    marginLeft: "50%",
  },
  form: {
    width: "100%",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: 8,
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
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.gray600,
  },
  signupTextBold: {
    fontWeight: "700",
    color: colors.primary,
  },
  infoSection: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray900,
    marginBottom: 4,
    textAlign: "center",
  },
  infoText: {
    fontSize: 11,
    color: colors.gray600,
    textAlign: "center",
  },
});

export default LoginScreen;
