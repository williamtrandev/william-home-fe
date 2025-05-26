import { axiosInstance } from "@/lib/axios";

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

const TOKEN_KEY = "access_token";

class AuthService {
    private setToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    private removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    async getGoogleAuthUrl() {
        const response = await axiosInstance.get("/api/login/google/url");
        return response.data.url;
    }

    async handleGoogleCallback(credential: string) {
        const response = await axiosInstance.post("/api/auth/login/google", {
            accessToken: credential,
        });
        const { accessToken } = response.data;
        this.setToken(accessToken);
        return { accessToken };
    }

    async logout() {
        this.removeToken();
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    }
}

export const authService = new AuthService();
