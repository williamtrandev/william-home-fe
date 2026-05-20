import axiosInstance from "@/lib/axios";
import { getToken, requestNotificationPermission } from "@/lib/firebase";

const TOKEN_KEY = "fcm_token";
const PUSH_ENABLED_KEY = "push_notifications_enabled";

interface DeviceInfo {
    userAgent: string;
    platform: string;
    timestamp: number;
}

export class NotificationPermissionDeniedError extends Error {
    constructor() {
        super("PERMISSION_DENIED");
        this.name = "NotificationPermissionDeniedError";
    }
}

class NotificationService {
    private baseUrl = "/api/notifications";
    private lastPostedToken: string | null = null;
    private saveTokenInFlight: Promise<void> | null = null;

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

    getBrowserPermission(): NotificationPermission {
        if (typeof Notification === "undefined") return "denied";
        return Notification.permission;
    }

    private setPushEnabled(enabled: boolean) {
        localStorage.setItem(PUSH_ENABLED_KEY, enabled ? "1" : "0");
    }

    /** User opted in on this device (explicit pref only; not browser permission alone). */
    isPushEnabled(): boolean {
        const pref = localStorage.getItem(PUSH_ENABLED_KEY);
        if (pref === "1") return true;
        if (pref === "0") return false;
        // Legacy: subscribed before PUSH_ENABLED_KEY existed
        return !!this.getStoredToken();
    }

    isPushPreferenceOn(): boolean {
        return this.isPushEnabled();
    }

    getPushStatus(): "on" | "off" | "blocked" | "pending" {
        const permission = this.getBrowserPermission();
        if (!this.isPushEnabled()) return "off";
        if (permission === "denied") return "blocked";
        if (permission === "granted" && this.getStoredToken()) return "on";
        if (permission === "granted") return "pending";
        return "pending";
    }

    private async hasActiveServerTokens(): Promise<boolean> {
        try {
            const response = await axiosInstance.get<
                { fcmToken?: string }[]
            >(`${this.baseUrl}/tokens`);
            return Array.isArray(response.data) && response.data.length > 0;
        } catch {
            return false;
        }
    }

    private async saveToken(token: string) {
        if (this.lastPostedToken === token) return;

        if (this.saveTokenInFlight) {
            await this.saveTokenInFlight;
            if (this.lastPostedToken === token) return;
        }

        this.saveTokenInFlight = (async () => {
            const deviceInfo = this.getDeviceInfo();
            await axiosInstance.post(`${this.baseUrl}/token`, {
                fcmToken: token,
                deviceInfo,
            });
            this.lastPostedToken = token;
        })();

        try {
            await this.saveTokenInFlight;
        } finally {
            this.saveTokenInFlight = null;
        }
    }

    private async syncTokenIfGranted(): Promise<void> {
        if (this.getBrowserPermission() !== "granted") return;

        const stored = this.getStoredToken();
        const token = await getToken();
        if (!token) {
            this.removeStoredToken();
            this.lastPostedToken = null;
            return;
        }

        if (token !== stored) {
            this.setStoredToken(token);
        }
        await this.saveToken(token);
    }

    private async deactivateAllServerTokens(): Promise<void> {
        try {
            await axiosInstance.delete(`${this.baseUrl}/tokens`);
        } catch (error) {
            console.error("Error deactivating all push tokens:", error);
        }
    }

    /**
     * Sync FCM when user opted in. Never turns push back on after explicit opt-out (pref "0").
     */
    async reconcilePushPreference(): Promise<void> {
        const permission = this.getBrowserPermission();
        const pref = localStorage.getItem(PUSH_ENABLED_KEY);

        if (pref === "0") {
            return;
        }

        if (permission === "denied") {
            if (pref === "1") {
                await this.disablePush();
            }
            return;
        }

        if (pref === "1") {
            if (permission === "granted") {
                await this.syncTokenIfGranted();
            }
            return;
        }

        // Legacy: no pref — only restore if server still has an active subscription
        if (permission !== "granted") return;

        const serverHasTokens = await this.hasActiveServerTokens();
        if (!serverHasTokens) return;

        this.setPushEnabled(true);
        await this.syncTokenIfGranted();
    }

    async removeToken(token: string) {
        try {
            await axiosInstance.delete(
                `${this.baseUrl}/token/${encodeURIComponent(token)}`
            );
            this.removeStoredToken();
            if (this.lastPostedToken === token) {
                this.lastPostedToken = null;
            }
        } catch (error) {
            console.error("Error removing notification token:", error);
            throw error;
        }
    }

    /** @deprecated Use reconcilePushPreference */
    async syncIfEnabled(): Promise<void> {
        await this.reconcilePushPreference();
    }

    async enablePush(): Promise<void> {
        const permission = this.getBrowserPermission();
        if (permission === "denied") {
            throw new NotificationPermissionDeniedError();
        }

        let token: string | null = null;
        if (permission === "default") {
            token = await requestNotificationPermission();
        } else {
            token = await getToken();
        }

        if (!token) {
            throw new Error("Failed to get FCM token");
        }

        this.setStoredToken(token);
        await this.saveToken(token);
        this.setPushEnabled(true);
    }

    async disablePush(): Promise<void> {
        this.setPushEnabled(false);
        const token = this.getStoredToken();
        if (token) {
            try {
                await this.removeToken(token);
            } catch {
                this.removeStoredToken();
                this.lastPostedToken = null;
            }
        }
        await this.deactivateAllServerTokens();
        this.removeStoredToken();
        this.lastPostedToken = null;
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

    async handleLogout() {
        // Logout ≠ turn off push; keep pref so login reflects last toggle choice.
        this.removeStoredToken();
        this.lastPostedToken = null;
    }

    async handlePermissionRevoked() {
        await this.disablePush();
    }
}

export const notificationService = new NotificationService();
