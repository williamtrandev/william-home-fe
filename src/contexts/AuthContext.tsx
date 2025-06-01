import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification.service";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { authService } from "@/services/auth.service";

interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
    currentHouseRole?: "OWNER" | "MEMBER";
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const navigate = useNavigate();
    const { t } = useLanguage();

    const logout = async () => {
        try {
            // Remove notification token
            await notificationService.handleLogout();

            // Remove user data
            authService.logout();

            // Show success message
            toast.success(t("logoutSuccess"));

            // Navigate to login page
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(t("logoutFailed"));
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
