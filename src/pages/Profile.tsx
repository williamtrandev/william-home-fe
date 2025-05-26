import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Mail, User, Shield, Save, Upload } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        avatar: user?.avatar || "",
    });

    const handleSave = () => {
        // Simulate saving
        toast.success(t("profileUpdated"));
        setIsEditing(false);
    };

    const handleImageUpload = () => {
        // Simulate image upload
        toast.success(t("avatarUpdated"));
    };

    return (
        <div className="p-6 space-y-8">
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
                                    />
                                    <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                                        {formData.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleImageUpload}
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
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-primary capitalize">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        15
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t("expenses")}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        3
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t("months")}
                                    </div>
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

                            <div className="space-y-2">
                                <Label
                                    htmlFor="avatar"
                                    className="text-sm font-medium"
                                >
                                    {t("avatarUrl")}
                                </Label>
                                <div className="relative">
                                    <Upload className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="avatar"
                                        value={formData.avatar}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                avatar: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        className="pl-10 h-12 bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
                                        placeholder={t("enterAvatarUrl")}
                                    />
                                </div>
                            </div>

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
                                        onClick={() => setIsEditing(false)}
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
