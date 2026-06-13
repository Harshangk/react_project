import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { applyTheme, getPreferredTheme, toggleTheme as switchTheme } from "../../utils/theme";
import { getInitials } from "../../utils/getInitials";
import { useUser } from "../../context/UserContext";

const ROUTE_NAMES = {
    "/dashboard":                    "Dashboard",
    "/leads/buylead":                "Add Buy Lead",
    "/leads/buyleadlist":            "All Buy Leads",
    "/leads/buyleadfollowuplist":    "Followup List",
    "/leads/buyleadimport":          "Import Leads",
    "/leads/buyleadtracker":         "Import Tracker",
    "/leads/untouchedlist":          "Untouched Leads",
    "/leads/reallocationlist":       "Reallocation",
    "/leads/buyleadlostlist":        "Lost Leads",
};

function getPageTitle(pathname) {
    if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];
    /* /leads/buylead/:id → Edit Buy Lead */
    if (pathname.startsWith("/leads/buylead/")) return "Edit Buy Lead";
    if (pathname.startsWith("/leads/buyleadfollowup/")) return "Followup";
    return "";
}

function Header({ onMenuClick }) {
    const { user, userLoading: loading } = useUser();
    const location = useLocation();
    const [showNotif, setShowNotif] = useState(false);
    const [theme, setTheme]         = useState(() => getPreferredTheme());
    const notifRef = useRef();

    const pageTitle = getPageTitle(location.pathname);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    };

    const handleThemeToggle = () => setTheme(switchTheme());

    useEffect(() => {
        const close = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    useEffect(() => {
        const onThemeChange   = (e) => setTheme(applyTheme(e.detail?.theme || getPreferredTheme()));
        const onStorageChange = (e) => { if (e.key === "theme") setTheme(applyTheme(e.newValue || getPreferredTheme())); };
        window.addEventListener("themechange", onThemeChange);
        window.addEventListener("storage",     onStorageChange);
        return () => {
            window.removeEventListener("themechange", onThemeChange);
            window.removeEventListener("storage",     onStorageChange);
        };
    }, []);

    const initials = user?.userName ? getInitials(user.userName) : "?";
    const displayName = user?.userName || "";
    const displayRole = user?.roleName || "";

    return (
        <header className="header">
            <div className="header-left">
                {/* Hamburger — visible on mobile ≤ 1024px */}
                <button
                    type="button"
                    className="icon-btn mobile-menu-btn"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </button>

                {/* Page title — replaces non-functional search */}
                {pageTitle && (
                    <span className="header-page-title">{pageTitle}</span>
                )}
            </div>

            <div className="header-right">
                {/* Theme toggle */}
                <button
                    type="button"
                    className="icon-btn"
                    onClick={handleThemeToggle}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Notifications */}
                <div className="notif-container" ref={notifRef}>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setShowNotif(v => !v)}
                        aria-label="Notifications"
                        aria-haspopup="true"
                        aria-expanded={showNotif}
                        style={{ position: "relative" }}
                    >
                        <Bell size={18} />
                    </button>
                    {showNotif && (
                        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                            <div className="notif-empty">
                                <Bell size={28} strokeWidth={1.5} />
                                <p>No new notifications</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* User */}
                <div className="header-user">
                    {loading ? (
                        <Skeleton circle width={32} height={32} />
                    ) : (
                        <div className="header-avatar" title={displayName} aria-hidden="true">
                            {initials}
                        </div>
                    )}
                    <div className="header-user-info">
                        {loading ? (
                            <Skeleton width={80} height={12} />
                        ) : (
                            <div className="header-user-name">{displayName || "—"}</div>
                        )}
                        {!loading && displayRole && (
                            <div className="header-user-role">{displayRole}</div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <button
                    type="button"
                    className="icon-btn logout"
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default Header;
