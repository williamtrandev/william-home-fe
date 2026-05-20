import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    NotificationPermissionDeniedError,
    useNotificationSettings,
    type PushStatus,
} from "@/contexts/NotificationContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function statusLabel(
    status: PushStatus,
    t: (key: string) => string
): string {
    switch (status) {
        case "on":
            return t("notificationStatusOn");
        case "blocked":
            return t("notificationStatusBlocked");
        case "pending":
            return t("notificationStatusPending");
        default:
            return t("notificationStatusOff");
    }
}

export default function NotificationSettings() {
    const { t } = useLanguage();
    const {
        isEnabled,
        pushStatus,
        isBusy,
        browserPermission,
        enablePush,
        disablePush,
        syncPushState,
    } = useNotificationSettings();

    useEffect(() => {
        void syncPushState();
    }, [syncPushState]);

    const handleToggle = async (checked: boolean) => {
        try {
            if (checked) {
                await enablePush();
                toast.success(t("notificationPermissionGranted"));
            } else {
                await disablePush();
                toast.success(t("notificationPermissionRemoved"));
            }
        } catch (error) {
            if (error instanceof NotificationPermissionDeniedError) {
                toast.error(t("notificationPermissionDenied"), {
                    description: t("notificationDeniedHint"),
                    duration: 8000,
                });
                return;
            }
            console.error("Error toggling notifications:", error);
            toast.error(
                checked
                    ? t("notificationPermissionDenied")
                    : t("notificationPermissionRemoveFailed")
            );
        }
    };

    const permissionBlocked = browserPermission === "denied";

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
                <p
                    className={cn(
                        "text-sm font-medium",
                        pushStatus === "on" && "text-primary",
                        pushStatus === "blocked" && "text-destructive",
                        pushStatus === "pending" && "text-muted-foreground",
                        pushStatus === "off" && "text-muted-foreground"
                    )}
                >
                    {statusLabel(pushStatus, t)}
                </p>
                {permissionBlocked && (
                    <p className="text-xs text-muted-foreground">
                        {t("notificationDeniedHint")}
                    </p>
                )}
            </div>
            <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isBusy || permissionBlocked}
                aria-label={t("notifications")}
            />
        </div>
    );
}
