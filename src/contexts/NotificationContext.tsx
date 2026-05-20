import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { messaging } from "@/lib/firebase";
import { notificationEvents } from "@/lib/notification-events";
import {
    notificationService,
    NotificationPermissionDeniedError,
} from "@/services/notification.service";

export type PushStatus = "on" | "off" | "blocked" | "pending";

interface NotificationContextValue {
    isEnabled: boolean;
    pushStatus: PushStatus;
    isBusy: boolean;
    browserPermission: NotificationPermission;
    enablePush: () => Promise<void>;
    disablePush: () => Promise<void>;
    refresh: () => void;
    syncPushState: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
    null
);

function readPushUiState() {
    return {
        isEnabled: notificationService.isPushPreferenceOn(),
        pushStatus: notificationService.getPushStatus(),
    };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isEnabled, setIsEnabled] = useState(
        () => readPushUiState().isEnabled
    );
    const [pushStatus, setPushStatus] = useState<PushStatus>(
        () => readPushUiState().pushStatus
    );
    const [isBusy, setIsBusy] = useState(false);
    const [browserPermission, setBrowserPermission] = useState(
        notificationService.getBrowserPermission()
    );

    const refresh = useCallback(() => {
        setBrowserPermission(notificationService.getBrowserPermission());
        const next = readPushUiState();
        setIsEnabled(next.isEnabled);
        setPushStatus(next.pushStatus);
    }, []);

    const syncPushState = useCallback(async () => {
        try {
            await notificationService.reconcilePushPreference();
        } catch (error) {
            console.error("Failed to sync push token:", error);
        } finally {
            refresh();
        }
    }, [refresh]);

    useEffect(() => {
        if (!user) {
            setIsEnabled(false);
            return;
        }

        void syncPushState();

        return undefined;
    }, [user, syncPushState]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            const data = payload as {
                notification?: { title?: string; body?: string };
            };
            const { notification } = data;
            if (notification?.title) {
                toast(notification.title, {
                    description: notification.body,
                });
            }
            notificationEvents.notify();
        });

        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const onVisibility = () => {
            if (document.visibilityState !== "visible") return;
            void syncPushState();
            const permission = notificationService.getBrowserPermission();
            if (permission === "denied" && notificationService.isPushEnabled()) {
                void notificationService.handlePermissionRevoked().finally(refresh);
            }
        };

        document.addEventListener("visibilitychange", onVisibility);
        return () =>
            document.removeEventListener("visibilitychange", onVisibility);
    }, [user, refresh, syncPushState]);

    const enablePush = useCallback(async () => {
        setIsBusy(true);
        try {
            await notificationService.enablePush();
            refresh();
        } finally {
            setIsBusy(false);
        }
    }, [refresh]);

    const disablePush = useCallback(async () => {
        setIsBusy(true);
        try {
            await notificationService.disablePush();
            refresh();
        } finally {
            setIsBusy(false);
        }
    }, [refresh]);

    const value = useMemo(
        () => ({
            isEnabled,
            pushStatus,
            isBusy,
            browserPermission,
            enablePush,
            disablePush,
            refresh,
            syncPushState,
        }),
        [
            isEnabled,
            pushStatus,
            isBusy,
            browserPermission,
            enablePush,
            disablePush,
            refresh,
            syncPushState,
        ]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationSettings() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error(
            "useNotificationSettings must be used within NotificationProvider"
        );
    }
    return ctx;
}

export { NotificationPermissionDeniedError };
