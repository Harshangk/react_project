import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("nav-open", sidebarOpen);
        return () => document.body.classList.remove("nav-open");
    }, [sidebarOpen]);

    return (
        <div className={`layout ${sidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Backdrop — click to close sidebar on mobile */}
            <div
                className="sidebar-overlay"
                role="presentation"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            <div className="main">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main>{children}</main>
            </div>
        </div>
    );
}

export default MainLayout;
