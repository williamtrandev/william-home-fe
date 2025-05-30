import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notification.service";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotificationSettings() {
    const [isEnabled, setIsEnabled] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        // Check if notifications are enabled
        if ("Notification" in window) {
            setIsEnabled(Notification.permission === "granted");
        }
    }, []);

    const handleToggle = async () => {
        if (!user) return;

        try {
            if (!isEnabled) {
                const permissionGranted =
                    await notificationService.requestNotificationPermission();
                if (permissionGranted) {
                    const subscription =
                        await notificationService.subscribeToPushNotifications(
                            user.id
                        );
                    if (subscription) {
                        setIsEnabled(true);
                        toast.success(t("notificationsEnabled"));
                    }
                }
            } else {
                const unsubscribed =
                    await notificationService.unsubscribeFromPushNotifications(
                        user.id
                    );
                if (unsubscribed) {
                    setIsEnabled(false);
                    toast.success(t("notificationsDisabled"));
                }
            }
        } catch (error) {
            console.error("Error toggling notifications:", error);
            toast.error(t("notificationToggleError"));
        }
    };

    return (
        <div className="flex items-center justify-between p-4">
            <div>
                <h3 className="text-lg font-medium">{t("notifications")}</h3>
                <p className="text-sm text-gray-500">
                    {t("notificationsDescription")}
                </p>
            </div>
            <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-blue-600"
            />
        </div>
    );
}
