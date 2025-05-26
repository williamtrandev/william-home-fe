import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

declare global {
    interface BeforeInstallPromptEvent extends Event {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }
}

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallButton(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Kiểm tra xem ứng dụng đã được cài đặt chưa
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowInstallButton(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
            setShowInstallButton(false);
        } else {
            console.log("User dismissed the install prompt");
        }

        setDeferredPrompt(null);
    };

    if (!showInstallButton) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <Download className="w-4 h-4 mr-2" />
                {t("installApp")}
            </Button>
        </div>
    );
};

export default PWAInstallPrompt;
