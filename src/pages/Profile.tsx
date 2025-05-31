import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Mail, User, Save, Crown } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Function to get avatar options based on picture URL
const getAvatarOptions = (pictureUrl: string) => {
    const isFemale = pictureUrl.toLowerCase().includes("female");
    const gender = isFemale ? "female" : "male";
    return Array.from(
        { length: 8 },
        (_, i) => `/avatar/${gender}/avatar${i + 1}.png`
    );
};

const Profile = () => {
    const { t } = useLanguage();
    const { user: authUser, setUser } = useAuth();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        avatar: "",
    });

    // Get user data once
    const userData = authService.getUser();

    // Get avatar options based on current form data or user's picture
    const avatarOptions = getAvatarOptions(
        formData.avatar || userData?.picture || ""
    );

    // Initialize form data only once
    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                avatar: userData.picture || avatarOptions[0],
            });
        }
    }, []); // Empty dependency array to run only once

    const handleSave = async () => {
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                picture: formData.avatar,
            };

            await authService.updateProfile(updateData);
            // Update user in context to reflect changes in header
            setUser({
                ...authUser!,
                name: formData.name,
                email: formData.email,
                picture: formData.avatar,
            });
            toast.success(t("profileUpdated"));
            setIsEditing(false);
        } catch (error) {
            toast.error(t("updateFailed"));
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setFormData((prev) => ({
            ...prev,
            avatar: avatarUrl,
        }));
    };

    const handleCancel = () => {
        // Reset form data to original values
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                avatar: userData.picture || "",
            });
        }
        setIsEditing(false);
    };

    // Check if user has no avatar
    const hasNoAvatar = !userData?.picture;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("profile")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t("manageProfile")}
                    </p>
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                    {isEditing ? t("cancel") : t("editProfile")}
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="text-center pb-2">
                            <div className="relative mx-auto">
                                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                                    <AvatarImage
                                        src={formData.avatar}
                                        alt={formData.name}
                                        className="object-cover w-full h-full"
                                    />
                                    <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                                        {formData.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                            handleAvatarSelect(avatarOptions[0])
                                        }
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {formData.name}
                                </h3>
                                <p className="text-muted-foreground">
                                    {formData.email}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Badge
                                        variant={
                                            authUser?.currentHouseRole ===
                                            "OWNER"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className={`capitalize ${
                                            authUser?.currentHouseRole ===
                                            "OWNER"
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {authUser?.currentHouseRole ===
                                        "OWNER" ? (
                                            <div className="flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                {t("owner")}
                                            </div>
                                        ) : (
                                            t("member")
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Settings Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                {t("personalInfo")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium"
                                    >
                                        {t("fullName")}
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            disabled={!isEditing}
                                            className="pl-10 h-12 bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
                                            placeholder={t("enterFullName")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                    >
                                        {t("emailAddress")}
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            disabled={!isEditing}
                                            className="pl-10 h-12 bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
                                            placeholder={t("enterEmail")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">
                                        {t("selectAvatar")}
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 bg-muted/30 rounded-xl">
                                        {avatarOptions.map((avatar, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    handleAvatarSelect(avatar)
                                                }
                                                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                                                    formData.avatar === avatar
                                                        ? "ring-2 ring-primary shadow-lg"
                                                        : "hover:shadow-md"
                                                }`}
                                            >
                                                <div className="aspect-square relative group">
                                                    <Avatar className="w-full h-full rounded-xl">
                                                        <AvatarImage
                                                            src={avatar}
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                                                            {index + 1}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {formData.avatar ===
                                                        avatar && (
                                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <div className="w-4 h-4 rounded-full bg-primary" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 pt-4 border-t"
                                >
                                    <Button
                                        onClick={handleSave}
                                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {t("saveChanges")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="h-12"
                                    >
                                        {t("cancel")}
                                    </Button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
