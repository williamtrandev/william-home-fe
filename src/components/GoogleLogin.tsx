import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AvatarSelectorModal from "./auth/AvatarSelectorModal";

interface GoogleLoginProps {
    onSuccess?: () => void;
}

const GoogleLoginButton = ({ onSuccess }: GoogleLoginProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { setUser } = useAuth();

    useEffect(() => {
        // Load Google Identity Services
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);
            const { credential } = credentialResponse;

            // Handle the callback
            const response = await authService.handleGoogleCallback(credential);
            console.log("Google login response:", response);

            const { user } = response;
            console.log("User data:", user);

            // Set user in context
            setUser(user);

            // Show success message
            toast.success(t("loginSuccess"));

            // Check if user has avatar
            if (!user.picture) {
                console.log("No avatar found, showing modal");
                setShowAvatarModal(true);
            } else {
                console.log("User has avatar, navigating to dashboard");
                onSuccess?.();
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error("Error handling Google callback:", error);
            const errorMessage =
                error.response?.data?.error?.[language] || t("loginFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarSelect = async (avatarUrl: string) => {
        try {
            console.log("Selected avatar URL:", avatarUrl);
            const updatedUser = await authService.updateProfile({
                picture: avatarUrl,
            });
            console.log("Updated user:", updatedUser);

            setUser(updatedUser);
            setShowAvatarModal(false);
            toast.success(t("avatarUpdated"));
            onSuccess?.();
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Error updating avatar:", error);
            const errorMessage =
                error.response?.data?.error?.[language] ||
                t("avatarUpdateFailed");
            toast.error(errorMessage);
        }
    };

    const handleGoogleError = () => {
        toast.error(t("loginError"));
        setIsLoading(false);
    };

    const handleGoogleLogin = () => {
        if (typeof window.google !== "undefined") {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: "email profile",
                callback: (response: any) => {
                    if (response.access_token) {
                        handleGoogleSuccess({
                            credential: response.access_token,
                        });
                    }
                },
            });
            client.requestAccessToken();
        }
    };

    return (
        <>
            <div className="w-full">
                <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {t("loginWithGoogle")}
                        </div>
                    )}
                </Button>
            </div>

            <AvatarSelectorModal
                isOpen={showAvatarModal}
                onClose={() => setShowAvatarModal(false)}
                onSelect={handleAvatarSelect}
            />
        </>
    );
};

// Add type declaration for window.google
declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: any) => {
                        requestAccessToken: () => void;
                    };
                };
            };
        };
    }
}

export default GoogleLoginButton;
