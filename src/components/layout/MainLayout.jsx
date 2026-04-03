import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout({ children }) {
    return (
        <div className="layout">
            <Sidebar />

            <div className="main">
                <Header />

                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
