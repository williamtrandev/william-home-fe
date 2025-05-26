import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            toast.error("Invalid authentication code");
            navigate("/");
            return;
        }

        const handleCallback = async () => {
            try {
                await authService.loginWithGoogle(code);
                navigate("/dashboard");
            } catch (error) {
                console.error("Error during Google authentication:", error);
                toast.error("Authentication failed");
                navigate("/");
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Authenticating...</h1>
                <p className="text-muted-foreground mt-2">
                    Please wait while we complete your login
                </p>
            </div>
        </div>
    );
}
