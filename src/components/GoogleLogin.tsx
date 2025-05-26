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

interface GoogleLoginProps {
    onSuccess?: () => void;
}

const GoogleLoginButton = ({ onSuccess }: GoogleLoginProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setUser } = useAuth();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);
            const { credential } = credentialResponse;

            // Handle the callback
            await authService.handleGoogleCallback(credential);

            // Set user in context
            setUser({
                id: "1",
                email: "user@example.com",
                name: "User",
            });

            // Show success message
            toast.success(t("loginSuccess"));

            // Call onSuccess callback if provided
            onSuccess?.();

            // Navigate to dashboard
            navigate("/dashboard");
        } catch (error) {
            console.error("Error handling Google callback:", error);
            toast.error(t("loginFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error(t("loginError"));
        setIsLoading(false);
    };

    return (
        <div className="w-full">
            <GoogleOAuthLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
                text="signin_with"
                locale="vi"
                containerProps={{
                    style: {
                        display: "none",
                    },
                }}
            />
            <Button
                onClick={() => {
                    const googleButton =
                        document.querySelector('div[role="button"]');
                    if (googleButton) {
                        (googleButton as HTMLElement).click();
                    }
                }}
                disabled={isLoading}
                className="w-full h-14 gradient-primary text-white text-lg font-semibold hover-lift shadow-xl border-0"
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
