import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.2:5000"; // Updated to local IP for physical device testing

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);

// Product APIs
export const getProducts = (search = "") =>
  api.get(`/products${search ? `?search=${search}` : ""}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Stock APIs
export const stockIn = (data) => api.post("/stock/in", data);
export const stockOut = (data) => api.post("/stock/out", data);

// Transaction APIs
export const getTransactions = (limit = 50) =>
  api.get(`/transactions?limit=${limit}`);
export const getProductTransactions = (productId) =>
  api.get(`/transactions/product/${productId}`);

export default api;
