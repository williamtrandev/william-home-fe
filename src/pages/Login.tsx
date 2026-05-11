import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
    Moon,
    Sun,
    Sparkles,
    Users,
    BarChart3,
    ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import GoogleLogin from "@/components/GoogleLogin";
import AnimatedBackground from "@/components/AnimatedBackground";
import { LOGOUT_REASON_KEY } from "@/lib/axios";

const Login = () => {
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (authService.isAuthenticated()) {
            navigate("/dashboard");
            return;
        }

        // Surface a localized reason when the axios interceptor force-logged
        // the user out (e.g. they were removed from the house). One-shot flag.
        const reason = sessionStorage.getItem(LOGOUT_REASON_KEY);
        if (reason) {
            sessionStorage.removeItem(LOGOUT_REASON_KEY);
            if (reason === "MEMBERSHIP_REVOKED") {
                toast.error(t("membershipRevoked"));
            }
        }
    }, [navigate, t]);

    const features = [
        { icon: Sparkles, label: t("featureExpenseTracking") },
        { icon: Users, label: t("featureFamilyShared") },
        { icon: BarChart3, label: t("featureSmartInsights") },
    ];

    return (
        <div className="relative isolate min-h-screen overflow-hidden">
            <AnimatedBackground variant="hero" />

            <div className="absolute top-6 right-6 flex gap-2 z-20">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="w-11 h-11 rounded-full bg-white/70 dark:bg-card/70 backdrop-blur-md border border-white/40 dark:border-border hover:bg-white/90 dark:hover:bg-card"
                >
                    {theme === "light" ? (
                        <Moon className="w-5 h-5 text-primary" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setLanguage(language === "vi" ? "en" : "vi")
                    }
                    className="w-11 h-11 rounded-full bg-white/70 dark:bg-card/70 backdrop-blur-md border border-white/40 dark:border-border text-lg hover:bg-white/90 dark:hover:bg-card"
                >
                    {language === "vi" ? "🇻🇳" : "🇺🇸"}
                </Button>
            </div>

            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <Card className="border border-white/40 dark:border-border/60 bg-white/70 dark:bg-card/70 backdrop-blur-xl shadow-2xl shadow-primary/10">
                        <CardHeader className="text-center pt-10 pb-4">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{
                                    delay: 0.25,
                                    duration: 0.7,
                                    type: "spring",
                                    stiffness: 180,
                                    damping: 14,
                                }}
                                className="mx-auto relative mb-6"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/40 ring-4 ring-white/40 dark:ring-primary/20">
                                    W
                                </div>
                                {/* Subtle pulse ring */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.4, 0, 0.4],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeOut",
                                    }}
                                    className="absolute inset-0 rounded-2xl bg-primary/30 -z-10"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.5 }}
                            >
                                <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                    {t("welcome")}
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base text-muted-foreground mt-2 px-2">
                                    {t("loginTagline")}
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="px-6 sm:px-8 pb-8">
                            {/* Google login */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <GoogleLogin onSuccess={() => {}} />
                            </motion.div>

                            {/* Divider */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.75, duration: 0.4 }}
                                className="flex items-center gap-3 my-6"
                            >
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                    {t("loginDescription")}
                                </span>
                                <div className="flex-1 h-px bg-border" />
                            </motion.div>

                            {/* Feature pills */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.1,
                                            delayChildren: 0.85,
                                        },
                                    },
                                }}
                                className="flex flex-wrap gap-2 justify-center"
                            >
                                {features.map((feature) => (
                                    <motion.span
                                        key={feature.label}
                                        variants={{
                                            hidden: { opacity: 0, y: 8 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 text-primary text-xs font-medium border border-primary/20"
                                    >
                                        <feature.icon className="w-3.5 h-3.5" />
                                        {feature.label}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                        className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                            © {new Date().getFullYear()} William's Home
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
