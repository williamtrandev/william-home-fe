import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header 
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onProfileClick={() => navigate("/profile")}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout; 