import axios from "axios";
import { API_URL } from "@/config";

// Version number to force browser to reload
const VERSION = "1.0.0";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const axiosInstance = axios.create({
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

            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            if (refreshToken) {
                try {
                    // Try to refresh the token
                    const response = await axios.post(
                        `${API_URL}/api/auth/refresh-token`,
                        {
                            refreshToken,
                        }
                    );

                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data;

                    // Save new tokens
                    localStorage.setItem(TOKEN_KEY, accessToken);
                    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

                    // Update the failed request's authorization header
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh token failed:", refreshError);
                }
            }

            // If refresh token fails or doesn't exist, clear all auth data and redirect to login
            localStorage.clear();

            // Prevent navigation loop by checking current path
            if (!window.location.pathname.includes("/login")) {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export { axiosInstance as default, VERSION };
