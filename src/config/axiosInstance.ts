import axios from "axios";

const isLocal = window.location.hostname === "localhost";

const axiosInstance = axios.create({
  baseURL: isLocal
    ? "http://localhost:3000/api"   // Local development
    : "https://nsqf.onrender.com/api", // Production (Render)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in every request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle global errors, like token expiration.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle unauthorized errors by clearing credentials
    if (error.response?.status === 401) {
      console.error("Unauthorized, logging out...");
      localStorage.removeItem("token");
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
