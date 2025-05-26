import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { User } from "@/services/auth.service";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
            // Set a default user object since we're not fetching user info
            setUser({
                id: "1",
                email: "user@example.com",
                name: "User",
            });
        }
    }, []);

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
