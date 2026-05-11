import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="relative isolate min-h-screen overflow-hidden flex items-center justify-center px-4">
            <AnimatedBackground variant="hero" />

            <div className="text-center">
                <h1 className="text-7xl font-bold mb-4 text-foreground tracking-tight">
                    404
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                    Oops! Page not found
                </p>
                <a
                    href="/"
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                    Return to Home
                </a>
            </div>
        </div>
    );
};

export default NotFound;
