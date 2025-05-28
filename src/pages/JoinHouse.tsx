import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { authService } from "@/services/auth.service";

const JoinHouse = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleAccept = async () => {
        if (!token) return;

        try {
            setIsLoading(true);
            await authService.joinHouse(token);
            toast.success(t("joinHouseSuccess"));
            navigate("/dashboard");
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[t("language")] ||
                t("joinHouseFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!token) return;

        try {
            setIsLoading(true);
            await authService.rejectHouse(token);
            toast.success(t("rejectHouseSuccess"));
            navigate("/login");
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[t("language")] ||
                t("rejectHouseFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        W
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("joinHouseTitle")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("joinHouseDescription")}
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                {t("acceptInvitation")}
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleReject}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-300"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <X className="w-5 h-5 mr-2" />
                                {t("rejectInvitation")}
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinHouse;
