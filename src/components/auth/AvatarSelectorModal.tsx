import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface AvatarSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
}

const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const { t } = useLanguage();
    const [selectedAvatar, setSelectedAvatar] = useState<string>("");

    const maleAvatars = Array.from({ length: 8 }, (_, i) => ({
        id: `male-${i + 1}`,
        url: `/avatar/male/avatar${i + 1}.png`,
    }));

    const femaleAvatars = Array.from({ length: 8 }, (_, i) => ({
        id: `female-${i + 1}`,
        url: `/avatar/female/avatar${i + 1}.png`,
    }));

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        onSelect(avatarUrl);
    };

    // Add debug log
    console.log("Modal state:", { isOpen, selectedAvatar });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {t("selectAvatar")}
                    </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="male" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="male" className="text-xl py-3">
                            {t("male")}
                        </TabsTrigger>
                        <TabsTrigger value="female" className="text-xl py-3">
                            {t("female")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="male">
                        <div className="grid grid-cols-4 gap-6 p-6">
                            {maleAvatars.map((avatar) => (
                                <motion.div
                                    key={avatar.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`cursor-pointer rounded-full overflow-hidden border-4 transition-all ${
                                        selectedAvatar === avatar.url
                                            ? "border-primary scale-110 shadow-xl"
                                            : "border-transparent hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                        handleAvatarSelect(avatar.url)
                                    }
                                >
                                    <img
                                        src={avatar.url}
                                        alt={`Male Avatar ${avatar.id}`}
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="female">
                        <div className="grid grid-cols-4 gap-6 p-6">
                            {femaleAvatars.map((avatar) => (
                                <motion.div
                                    key={avatar.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`cursor-pointer rounded-full overflow-hidden border-4 transition-all ${
                                        selectedAvatar === avatar.url
                                            ? "border-primary scale-110 shadow-xl"
                                            : "border-transparent hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                        handleAvatarSelect(avatar.url)
                                    }
                                >
                                    <img
                                        src={avatar.url}
                                        alt={`Female Avatar ${avatar.id}`}
                                        className="w-full h-full object-cover aspect-square"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AvatarSelectorModal;
