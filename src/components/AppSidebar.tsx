import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
    Home,
    Calendar,
    User,
    X,
    TrendingUp,
    Wallet,
    Users,
    LayoutDashboard,
    History,
    LogOut,
    Menu,
    Settings,
    HelpCircle,
    Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = React.useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        // Initial check
        checkMobile();

        // Add event listener
        window.addEventListener("resize", checkMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: t("dashboard"),
            path: "/dashboard",
        },
        {
            icon: History,
            label: t("previous"),
            path: "/previous",
        },
        {
            icon: User,
            label: t("profile"),
            path: "/profile",
        },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        W
                    </div>
                    <div>
                        <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            William's Home
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Family Expense Manager
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="flex-1 p-4">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Button
                                key={item.path}
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start h-12 px-4 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                        : "hover:bg-primary/10"
                                )}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 mr-3",
                                        isActive ? "text-white" : "text-primary"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "font-medium",
                                        isActive
                                            ? "text-white"
                                            : "text-foreground"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Button>
                        );
                    })}
                </nav>

                <div className="mt-8 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200"
                        onClick={() => navigate("/notifications")}
                    >
                        <div className="relative">
                            <Bell className="w-5 h-5 mr-3 text-primary" />
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                                3
                            </Badge>
                        </div>
                        <span className="font-medium text-foreground">
                            {t("notifications")}
                        </span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200"
                        onClick={() => navigate("/settings")}
                    >
                        <Settings className="w-5 h-5 mr-3 text-primary" />
                        <span className="font-medium text-foreground">
                            {t("settings")}
                        </span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4 rounded-xl hover:bg-primary/10 transition-all duration-200"
                        onClick={() => navigate("/help")}
                    >
                        <HelpCircle className="w-5 h-5 mr-3 text-primary" />
                        <span className="font-medium text-foreground">
                            {t("help")}
                        </span>
                    </Button>
                </div>
            </div>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start h-12 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">{t("logout")}</span>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side="left"
                    className="p-0 w-[280px] sm:w-[320px]"
                >
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: 280 }}
                className="hidden md:block border-r bg-background"
            >
                <SidebarContent />
            </motion.div>
        </>
    );
};

export default AppSidebar;
