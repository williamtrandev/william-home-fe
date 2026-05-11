import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LogOut, Moon, Sun, Menu, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { authService } from "@/services/auth.service";

interface HeaderProps {
    onMenuClick: () => void;
    onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onProfileClick }) => {
    const { t, language, setLanguage } = useLanguage();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const userData = authService.getUser();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    const truncateEmail = (email: string) => {
        if (email.length > 30) {
            return email.substring(0, 30) + "...";
        }
        return email;
    };

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50"
        >
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="md:hidden hover:bg-primary/10"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    {/* Logo placeholder — keep commented until brand asset is finalized. */}
                </div>

                <div className="flex items-center gap-2">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="w-10 h-10 hover:bg-primary/10"
                        >
                            {theme === "light" ? (
                                <Moon className="w-5 h-5 text-primary" />
                            ) : (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            )}
                        </Button>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setLanguage(language === "vi" ? "en" : "vi")
                            }
                            className="w-10 h-10 hover:bg-primary/10 text-lg"
                        >
                            {language === "vi" ? "🇻🇳" : "🇺🇸"}
                        </Button>
                    </motion.div>

                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/10"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            className="object-cover"
                                            src={userData?.picture}
                                            alt={userData?.name}
                                        />
                                        <AvatarFallback>
                                            {userData?.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-64"
                            align="end"
                            forceMount
                        >
                            <div className="flex flex-col space-y-2 p-4">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {userData?.name}
                                        </p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <p className="text-xs text-muted-foreground cursor-help">
                                                        {userData?.email &&
                                                            truncateEmail(
                                                                userData.email
                                                            )}
                                                    </p>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{userData?.email}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <p className="text-xs text-primary font-medium capitalize">
                                            {userData?.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer text-red-600 hover:text-red-700"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                <span>{t("logout")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
