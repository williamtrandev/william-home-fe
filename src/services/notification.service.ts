class NotificationService {
    private static instance: NotificationService;
    private swRegistration: ServiceWorkerRegistration | null = null;

    private constructor() {}

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async initialize() {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            try {
                this.swRegistration = await navigator.serviceWorker.register(
                    "/sw.js"
                );
                console.log("Service Worker registered successfully");
            } catch (error) {
                console.error("Service Worker registration failed:", error);
            }
        }
    }

    async requestNotificationPermission(): Promise<boolean> {
        try {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            return false;
        }
    }

    async subscribeToPushNotifications(
        userId: string
    ): Promise<PushSubscription | null> {
        try {
            if (!this.swRegistration) {
                throw new Error("Service Worker not registered");
            }

            const subscription =
                await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
                });

            // Send subscription to backend
            await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    subscription,
                }),
            });

            return subscription;
        } catch (error) {
            console.error("Error subscribing to push notifications:", error);
            return null;
        }
    }

    async unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
        try {
            if (!this.swRegistration) {
                throw new Error("Service Worker not registered");
            }

            const subscription =
                await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                // Notify backend about unsubscribe
                await fetch("/api/notifications/unsubscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId,
                        subscription,
                    }),
                });
            }

            return true;
        } catch (error) {
            console.error(
                "Error unsubscribing from push notifications:",
                error
            );
            return false;
        }
    }
}

export const notificationService = NotificationService.getInstance();
