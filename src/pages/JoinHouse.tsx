import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { authService } from "@/services/auth.service";
import AnimatedBackground from "@/components/AnimatedBackground";

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
        <div className="relative isolate min-h-screen overflow-hidden flex items-center justify-center px-4 py-12">
            <AnimatedBackground variant="hero" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="border border-white/40 dark:border-border/60 bg-white/70 dark:bg-card/70 backdrop-blur-xl shadow-2xl shadow-primary/10">
                    <CardHeader className="text-center pt-10 pb-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -90, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                                delay: 0.2,
                                duration: 0.7,
                                type: "spring",
                                stiffness: 180,
                                damping: 14,
                            }}
                            className="mx-auto mb-6"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/40 ring-4 ring-white/40 dark:ring-primary/20">
                                W
                            </div>
                        </motion.div>

                        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {t("joinHouseTitle")}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-muted-foreground mt-2 px-2">
                            {t("joinHouseDescription")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 sm:px-8 pb-8">
                        <div className="space-y-3">
                            <Button
                                onClick={handleAccept}
                                disabled={isLoading}
                                className="w-full h-12"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
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
                                className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/30"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <X className="w-5 h-5 mr-2" />
                                        {t("rejectInvitation")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default JoinHouse;
