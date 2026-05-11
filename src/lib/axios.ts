import axios from "axios";
import { API_URL } from "@/config";

// Version number to force browser to reload
const VERSION = "1.0.0";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

/**
 * Backend 401 discriminator. Mirrors `code` field returned by
 * `src/middleware/auth.js` in the API server.
 */
type AuthErrorCode = "AUTH_INVALID" | "USER_NOT_FOUND" | "MEMBERSHIP_REVOKED";

/**
 * sessionStorage key the Login page reads on mount to surface a localized
 * toast (e.g. "You were removed from the house"). It's a one-shot flag —
 * cleared after being consumed.
 */
export const LOGOUT_REASON_KEY = "logout_reason";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const hardLogout = (reason: AuthErrorCode) => {
    // Targeted removal — DO NOT call localStorage.clear() here. That would
    // wipe persisted UI preferences ("theme", "language", …) and force the
    // login page to fall back to the OS prefers-color-scheme, flipping the
    // user from light → dark after logout.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
    if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const code = error.response?.data?.code as AuthErrorCode | undefined;

        if (status !== 401) {
            return Promise.reject(error);
        }

        // Membership was revoked server-side (e.g. owner removed the user).
        // Skip the refresh-token dance — refresh will also be rejected — and
        // log the user out immediately with a reason flag for the Login page.
        if (code === "MEMBERSHIP_REVOKED") {
            hardLogout("MEMBERSHIP_REVOKED");
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
            try {
                const response = await axios.post(
                    `${API_URL}/api/auth/refresh-token`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } =
                    response.data;

                localStorage.setItem(TOKEN_KEY, accessToken);
                localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError: any) {
                // Refresh endpoint also distinguishes MEMBERSHIP_REVOKED so we
                // honour it here too (otherwise the user lingers on a page
                // showing stale data until they click something else).
                const refreshCode = refreshError?.response?.data?.code as
                    | AuthErrorCode
                    | undefined;
                if (refreshCode === "MEMBERSHIP_REVOKED") {
                    hardLogout("MEMBERSHIP_REVOKED");
                    return Promise.reject(error);
                }
                console.error("Refresh token failed:", refreshError);
            }
        }

        hardLogout("AUTH_INVALID");
        return Promise.reject(error);
    }
);

export { axiosInstance as default, VERSION };
