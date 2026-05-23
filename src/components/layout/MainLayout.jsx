import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("nav-open", sidebarOpen);
        return () => document.body.classList.remove("nav-open");
    }, [sidebarOpen]);

    return (
        <div className={`layout ${sidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <button
                type="button"
                className="sidebar-overlay"
                aria-label="Close navigation"
                onClick={() => setSidebarOpen(false)}
            />

            <div className="main">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
