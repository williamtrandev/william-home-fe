import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Moon, Sun } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import GoogleLogin from "@/components/GoogleLogin";

const Login = () => {
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
            />
            <motion.div
                animate={{
                    rotate: -360,
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-xl"
            />

            {/* Theme & Language Toggle */}
            <div className="absolute top-6 right-6 flex gap-3">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        className="w-12 h-12 glass-effect border-white/30 hover:bg-white/20"
                    >
                        {theme === "light" ? (
                            <Moon className="w-5 h-5 text-blue-600" />
                        ) : (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        )}
                    </Button>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setLanguage(language === "vi" ? "en" : "vi")
                        }
                        className="w-12 h-12 glass-effect border-white/30 hover:bg-white/20 text-lg"
                    >
                        {language === "vi" ? "🇻🇳" : "🇺🇸"}
                    </Button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="shadow-2xl border-0 glass-effect backdrop-blur-xl">
                    <CardHeader className="text-center pb-8">
                        <motion.div
                            initial={{ scale: 0.5, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                delay: 0.3,
                                duration: 0.8,
                                type: "spring",
                            }}
                            className="mx-auto w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-2xl"
                        >
                            W
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                {t("welcome")}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
                                {t("loginDescription")}
                            </CardDescription>
                        </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            className="space-y-6"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <GoogleLogin
                                    onSuccess={() => {
                                        toast.success(t("loginSuccess"));
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
