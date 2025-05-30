import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
    GoogleOAuthProvider,
    GoogleLogin as GoogleOAuthLogin,
} from "@react-oauth/google";
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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);
            const { credential } = credentialResponse;

            // Handle the callback
            const response = await authService.handleGoogleCallback(credential);
            console.log("Google login response:", response); // Debug log

            const { user } = response;
            console.log("User data:", user); // Debug log

            // Set user in context
            setUser(user);

            // Show success message
            toast.success(t("loginSuccess"));

            // Check if user has avatar
            if (!user.picture) {
                console.log("No avatar found, showing modal"); // Debug log
                setShowAvatarModal(true);
            } else {
                console.log("User has avatar, navigating to dashboard"); // Debug log
                // Call onSuccess callback if provided
                onSuccess?.();
                // Navigate to dashboard
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error("Error handling Google callback:", error);
            // Get localized error message from API response
            const errorMessage =
                error.response?.data?.error?.[language] || t("loginFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarSelect = async (avatarUrl: string) => {
        try {
            console.log("Selected avatar URL:", avatarUrl); // Debug log
            const updatedUser = await authService.updateProfile({
                picture: avatarUrl,
            });
            console.log("Updated user:", updatedUser); // Debug log

            setUser(updatedUser);
            setShowAvatarModal(false);
            toast.success(t("avatarUpdated"));
            onSuccess?.();
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Error updating avatar:", error);
            // Get localized error message from API response
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

    // Add debug log
    console.log("Component state:", { showAvatarModal, isLoading });

    return (
        <>
            <div className="w-full">
                <GoogleOAuthLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_blue"
                    shape="rectangular"
                    text="signin_with"
                    locale="vi"
                />
            </div>

            <AvatarSelectorModal
                isOpen={showAvatarModal}
                onClose={() => setShowAvatarModal(false)}
                onSelect={handleAvatarSelect}
            />
        </>
    );
};

// Wrap the component with GoogleOAuthProvider
const GoogleLogin = (props: GoogleLoginProps) => {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLoginButton {...props} />
        </GoogleOAuthProvider>
    );
};

export default GoogleLogin;
