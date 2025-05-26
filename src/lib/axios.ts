import axios from "axios";
import { API_URL } from "@/config";

const TOKEN_KEY = "access_token";

export const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear token
            localStorage.removeItem(TOKEN_KEY);

            // Dispatch custom event for navigation
            window.dispatchEvent(new CustomEvent("unauthorized"));
        }

        return Promise.reject(error);
    }
);
