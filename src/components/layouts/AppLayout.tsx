import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen relative isolate overflow-hidden">
            <AnimatedBackground variant="subtle" />

            <AppSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onProfileClick={() => navigate("/profile")}
                />

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
