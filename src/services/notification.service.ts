import axiosInstance from "@/lib/axios";
import {
    requestNotificationPermission,
    onMessageListener,
    getToken,
} from "@/lib/firebase";

const TOKEN_KEY = "fcm_token";

interface DeviceInfo {
    userAgent: string;
    platform: string;
    timestamp: number;
}

class NotificationService {
    private baseUrl = "/api/notifications";

    private getStoredToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    private setStoredToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    private removeStoredToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    private getDeviceInfo(): DeviceInfo {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: Date.now(),
        };
    }

    async requestPermission() {
        try {
            // Check if we already have a token
            const storedToken = this.getStoredToken();
            if (storedToken) {
                return storedToken;
            }

            // Request permission and get token directly from Firebase
            const token = await getToken();
            if (token) {
                // Save token to server with device info
                await this.saveToken(token);
                this.setStoredToken(token);
                return token;
            }
            throw new Error("Failed to get FCM token");
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            throw error;
        }
    }

    async saveToken(token: string) {
        try {
            const deviceInfo = this.getDeviceInfo();
            await axiosInstance.post(`${this.baseUrl}/token`, {
                fcmToken: token,
                deviceInfo,
            });
        } catch (error) {
            console.error("Error saving notification token:", error);
            throw error;
        }
    }

    async removeToken(token: string) {
        try {
            await axiosInstance.delete(`${this.baseUrl}/token/${token}`);
            this.removeStoredToken();
        } catch (error) {
            console.error("Error removing notification token:", error);
            throw error;
        }
    }

    async getNotifications(page = 1) {
        try {
            const response = await axiosInstance.get(
                `${this.baseUrl}?page=${page}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    }

    async markAsRead(notificationId: string) {
        try {
            await axiosInstance.patch(`${this.baseUrl}/${notificationId}/read`);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }

    async markAllAsRead() {
        try {
            await axiosInstance.patch(`${this.baseUrl}/read-all`);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }

    onMessage(callback: (payload: any) => void) {
        onMessageListener().then((payload: any) => {
            callback(payload);
        });
    }

    // Check if token is valid and refresh if needed
    async validateToken() {
        const storedToken = this.getStoredToken();
        if (!storedToken) {
            return false;
        }

        try {
            // Get new token from Firebase
            const newToken = await getToken();
            if (newToken && newToken !== storedToken) {
                // Token has changed, update it with device info
                await this.saveToken(newToken);
                this.setStoredToken(newToken);
            }
            return true;
        } catch (error) {
            // If token is invalid, remove it
            this.removeStoredToken();
            return false;
        }
    }

    // Remove token when user logs out
    async handleLogout() {
        const token = this.getStoredToken();
        if (token) {
            try {
                await this.removeToken(token);
            } catch (error) {
                console.error("Error removing token on logout:", error);
            }
        }
    }

    // Remove token when user revokes notification permission
    async handlePermissionRevoked() {
        const token = this.getStoredToken();
        if (token) {
            try {
                await this.removeToken(token);
            } catch (error) {
                console.error(
                    "Error removing token on permission revoked:",
                    error
                );
            }
        }
    }
}

export const notificationService = new NotificationService();
