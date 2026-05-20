const PAUSED_KEY = "wh-app-paused";
const RELOADING_KEY = "wh-app-reloading";
const FILE_PICKER_GRACE_MS = 90_000;

let filePickerGraceUntil = 0;

function armFilePickerGrace(): void {
    filePickerGraceUntil = Date.now() + FILE_PICKER_GRACE_MS;
}

function shouldSkipReload(): boolean {
    return Date.now() < filePickerGraceUntil;
}

function markPaused(): void {
    if (sessionStorage.getItem(RELOADING_KEY) === "1") return;
    sessionStorage.setItem(PAUSED_KEY, "1");
}

function hardReload(): void {
    if (shouldSkipReload()) return;
    sessionStorage.setItem(RELOADING_KEY, "1");
    window.location.reload();
}

/**
 * Hard-reload when the user returns to the app (PWA/tab resume).
 * Skips reload briefly after opening the photo/file picker so uploads are not lost.
 */
export function initHardReloadOnAppOpen(): void {
    if (sessionStorage.getItem(RELOADING_KEY) === "1") {
        sessionStorage.removeItem(RELOADING_KEY);
        sessionStorage.removeItem(PAUSED_KEY);
    }

    document.addEventListener(
        "click",
        (e) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (
                target.closest('input[type="file"]') ||
                target.closest("[data-file-picker-trigger]")
            ) {
                armFilePickerGrace();
            }
        },
        true
    );

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            hardReload();
            return;
        }
        if (sessionStorage.getItem(PAUSED_KEY) === "1") {
            sessionStorage.removeItem(PAUSED_KEY);
            hardReload();
        }
    });

    window.addEventListener("pagehide", markPaused);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            markPaused();
        } else if (
            document.visibilityState === "visible" &&
            sessionStorage.getItem(PAUSED_KEY) === "1"
        ) {
            sessionStorage.removeItem(PAUSED_KEY);
            hardReload();
        }
    });
}
