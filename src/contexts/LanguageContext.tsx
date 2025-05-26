import React, { createContext, useContext, useEffect, useState } from "react";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

type Language = "en" | "vi";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: enTranslations,
    vi: viTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem("language") as Language;
        return savedLang || "vi";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
