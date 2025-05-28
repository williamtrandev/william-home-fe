import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import GoogleCallback from "@/pages/GoogleCallback";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import Members from "@/pages/Members";
import JoinHouse from "@/pages/JoinHouse";

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
                <Route path="/join-house/:token" element={<JoinHouse />} />
                <Route path="*" element={<Login />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/members" element={<Members />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                    path="/previous"
                    element={
                        <div className="container mx-auto p-6 space-y-8">
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
                        <div className="container mx-auto p-6 space-y-8">
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
                        <div className="container mx-auto p-6 space-y-8">
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
                        <div className="container mx-auto p-6 space-y-8">
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
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
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
