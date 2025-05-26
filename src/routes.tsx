import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import GoogleCallback from "@/pages/GoogleCallback";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";

function AppRoutes() {
    const { user } = useAuth();
    const { t } = useLanguage();

    if (!user) {
        return (
            <Routes>
                <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                />
                <Route path="*" element={<Login />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/previous"
                    element={
                        <div className="p-6">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t("previousMonths")}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {t("featureInDevelopment")}
                            </p>
                        </div>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <div className="p-6">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t("notifications")}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {t("featureInDevelopment")}
                            </p>
                        </div>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <div className="p-6">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t("settings")}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {t("featureInDevelopment")}
                            </p>
                        </div>
                    }
                />
                <Route
                    path="/help"
                    element={
                        <div className="p-6">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {t("help")}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {t("featureInDevelopment")}
                            </p>
                        </div>
                    }
                />
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
