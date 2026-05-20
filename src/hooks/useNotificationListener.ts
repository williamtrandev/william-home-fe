import { useEffect, useRef } from "react";
import { notificationEvents } from "@/lib/notification-events";

/** Subscribe to foreground push events (no token registration). */
export function useNotificationListener(callback: () => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        return notificationEvents.subscribe(() => callbackRef.current());
    }, []);
}
