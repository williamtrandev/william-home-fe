const PAUSED_KEY = "wh-app-paused";
const RELOADING_KEY = "wh-app-reloading";
const FILE_PICKER_GRACE_MS = 90_000;
const FORM_INTERACTION_GRACE_MS = 5 * 60_000;
/** Only treat as "left app" after hidden this long (keyboard/select are shorter). */
const BACKGROUND_DELAY_MS = 2000;

let reloadGraceUntil = 0;
let backgroundTimer: ReturnType<typeof setTimeout> | null = null;

function armReloadGrace(ms: number): void {
    reloadGraceUntil = Date.now() + ms;
}

function shouldSkipReload(): boolean {
    return Date.now() < reloadGraceUntil;
}

function clearBackgroundTimer(): void {
    if (backgroundTimer) {
        clearTimeout(backgroundTimer);
        backgroundTimer = null;
    }
}

function scheduleMarkPaused(): void {
    clearBackgroundTimer();
    backgroundTimer = setTimeout(() => {
        backgroundTimer = null;
        if (document.visibilityState !== "hidden") return;
        if (sessionStorage.getItem(RELOADING_KEY) === "1") return;
        sessionStorage.setItem(PAUSED_KEY, "1");
    }, BACKGROUND_DELAY_MS);
}

function hardReload(): void {
    if (shouldSkipReload()) return;
    sessionStorage.setItem(RELOADING_KEY, "1");
    window.location.reload();
}

function tryReloadOnResume(): void {
    if (sessionStorage.getItem(PAUSED_KEY) !== "1") return;
    sessionStorage.removeItem(PAUSED_KEY);
    hardReload();
}

function isProtectedInteractionTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest(
        [
            "[data-protected-form]",
            'input[type="file"]',
            "[data-file-picker-trigger]",
            "input",
            "textarea",
            "select",
            '[role="combobox"]',
            "[data-radix-select-trigger]",
        ].join(", ")
    );
}

function armFormInteractionGrace(target: EventTarget | null): void {
    if (isProtectedInteractionTarget(target)) {
        armReloadGrace(FORM_INTERACTION_GRACE_MS);
    }
}

/**
 * Hard-reload after user actually backgrounds the app (all phones / PWA).
 * Short overlays (keyboard, bank picker, Radix portal) must not mark paused immediately.
 */
export function initHardReloadOnAppOpen(): void {
    if (sessionStorage.getItem(RELOADING_KEY) === "1") {
        sessionStorage.removeItem(RELOADING_KEY);
        sessionStorage.removeItem(PAUSED_KEY);
    }

    document.addEventListener(
        "pointerdown",
        (e) => armFormInteractionGrace(e.target),
        true
    );

    document.addEventListener(
        "focusin",
        (e) => armFormInteractionGrace(e.target),
        true
    );

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            scheduleMarkPaused();
            return;
        }

        clearBackgroundTimer();
        tryReloadOnResume();
    });

    window.addEventListener("pagehide", () => {
        scheduleMarkPaused();
    });

    window.addEventListener("pageshow", (event) => {
        clearBackgroundTimer();

        if (event.persisted && sessionStorage.getItem(PAUSED_KEY) === "1") {
            sessionStorage.removeItem(PAUSED_KEY);
            hardReload();
            return;
        }

        tryReloadOnResume();
    });
}
