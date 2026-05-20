import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppRoutes from "@/routes";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleUnauthorized = () => {
            navigate("/login");
        };

        window.addEventListener("unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("unauthorized", handleUnauthorized);
        };
    }, [navigate]);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <Toaster richColors position="top-right" />
                            <AppRoutes />
                        </NotificationProvider>
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

// Wrap App with BrowserRouter
const AppWithRouter = () => (
    <Router>
        <App />
    </Router>
);

export default AppWithRouter;
