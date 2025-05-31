import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

// Create an event emitter
const notificationEvents = {
    listeners: new Set<() => void>(),
    subscribe(callback: () => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    },
    notify() {
        this.listeners.forEach((callback) => callback());
    },
};

export const useNotifications = (onExpenseUpdate?: () => void) => {
    const { t } = useLanguage();
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);

    useEffect(() => {
        const initializeNotifications = async () => {
            try {
                // First try to validate existing token
                const isValid = await notificationService.validateToken();
                if (isValid) {
                    setIsPermissionGranted(true);
                    return;
                }

                // If no valid token, request new permission
                await notificationService.requestPermission();
                setIsPermissionGranted(true);
            } catch (error) {
                console.error("Failed to initialize notifications:", error);
            }
        };

        initializeNotifications();

        // Listen for incoming messages
        notificationService.onMessage((payload) => {
            console.log("Notification received in useNotifications:", payload);
            const { notification } = payload;
            if (notification) {
                toast(notification.title, {
                    description: notification.body,
                });

                // Notify all listeners
                notificationEvents.notify();
            }
        });

        // Subscribe to events if callback provided
        let unsubscribe: (() => void) | undefined;
        if (onExpenseUpdate) {
            unsubscribe = notificationEvents.subscribe(onExpenseUpdate);
        }

        // Check permission status periodically
        const checkPermission = () => {
            if (Notification.permission === "denied") {
                notificationService.handlePermissionRevoked();
                setIsPermissionGranted(false);
            }
        };

        const intervalId = setInterval(checkPermission, 5000); // Check every 5 seconds

        return () => {
            clearInterval(intervalId);
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [onExpenseUpdate]);

    const requestPermission = async () => {
        try {
            await notificationService.requestPermission();
            setIsPermissionGranted(true);
            toast.success(t("notificationPermissionGranted"));
        } catch (error) {
            toast.error(t("notificationPermissionDenied"));
        }
    };

    const removePermission = async () => {
        try {
            const token = localStorage.getItem("fcm_token");
            if (token) {
                await notificationService.removeToken(token);
                setIsPermissionGranted(false);
                toast.success(t("notificationPermissionRemoved"));
            }
        } catch (error) {
            toast.error(t("notificationPermissionRemoveFailed"));
        }
    };

    return {
        isPermissionGranted,
        requestPermission,
        removePermission,
    };
};
