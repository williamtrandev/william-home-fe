import axiosInstance from "@/lib/axios";

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface UpdateProfileDto {
    picture?: string;
    name?: string;
}

class AuthService {
    private readonly TOKEN_KEY = "access_token";
    private readonly REFRESH_TOKEN_KEY = "refresh_token";
    private readonly USER_KEY = "user";

    async handleGoogleCallback(credential: string) {
        try {
            const response = await axiosInstance.post(
                "/api/auth/login/google",
                {
                    accessToken: credential,
                    houseId: "6834a4135d5b4d1a5a661152",
                }
            );
            const { accessToken, refreshToken, user } = response.data;

            // Store token and user data
            localStorage.setItem(this.TOKEN_KEY, accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));

            // Set default authorization header
            axiosInstance.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${accessToken}`;

            return { accessToken, user };
        } catch (error) {
            console.error("Error in handleGoogleCallback:", error);
            throw error;
        }
    }

    async login(data: {
        email: string;
        password: string;
    }): Promise<LoginResponse> {
        try {
            const response = await axiosInstance.post("/api/auth/login", data);
            const { user, token, refreshToken } = response.data;
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            return { user, token };
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    async updateProfile(data: UpdateProfileDto): Promise<User> {
        try {
            const response = await axiosInstance.put("/api/auth/profile", data);
            const updatedUser = response.data;

            // Update user in localStorage
            const currentUser = this.getUser();
            if (currentUser) {
                const newUser = { ...currentUser, ...updatedUser };
                localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
            }

            return updatedUser;
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        delete axiosInstance.defaults.headers.common["Authorization"];
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    async loginWithGoogle() {
        const response = await axiosInstance.get("/api/auth/google");
        return response.data;
    }

    async joinHouse(token: string) {
        const response = await axiosInstance.post(`/api/auth/join/${token}`);
        return response.data;
    }

    async rejectHouse(token: string) {
        const response = await axiosInstance.post(`/api/auth/reject/${token}`);
        return response.data;
    }
}

export const authService = new AuthService();
