import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseURL = envBaseUrl
  ? envBaseUrl.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : window.location.origin;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
