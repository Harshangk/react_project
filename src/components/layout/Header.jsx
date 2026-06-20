import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { applyTheme, getPreferredTheme, toggleTheme as switchTheme } from "../../utils/theme";
import { getInitials } from "../../utils/getInitials";
import { useUser } from "../../context/UserContext";
import { useLeadNotifications } from "../../hooks/useLeadNotifications";

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

const AVATAR_COLORS = [
    "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#ef4444", "#3b82f6", "#06b6d4",
    "#f97316", "#6366f1", "#14b8a6", "#84cc16",
];

function getAvatarColor(name = "") {
    if (!name) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getPageTitle(pathname) {
    if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];
    if (pathname.startsWith("/leads/buylead/")) return "Edit Buy Lead";
    if (pathname.startsWith("/leads/buyleadfollowup/")) return "Followup";
    return "";
}

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)   return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function Header({ onMenuClick }) {
    const { user, userLoading: loading, logout } = useUser();
    const navigate   = useNavigate();
    const location   = useLocation();
    const [showNotif, setShowNotif]       = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [theme, setTheme]               = useState(() => getPreferredTheme());
    const notifRef    = useRef();
    const userMenuRef = useRef();

    const pageTitle   = getPageTitle(location.pathname);
    const initials    = user?.userName ? getInitials(user.userName) : "?";
    const displayName = user?.userName || "";
    const displayRole = user?.roleName || "";
    const avatarColor = getAvatarColor(user?.userName || "");

    /* Lead notifications — userId starts polling, currentUsername filters to "my leads" */
    const { notifications, unreadCount, notifPermission, requestPermission, markAllRead, removeNotif } =
        useLeadNotifications(
            user?.id || user?.userId || displayName || null,
            displayName   // ← the filter: only notify if telecaller/executive === me
        );

    const handleThemeToggle = () => setTheme(switchTheme());

    const openNotif = () => {
        setShowNotif(v => !v);
        if (!showNotif) markAllRead(); // mark read when panel opens
    };

    /* Close both dropdowns on outside click */
    useEffect(() => {
        const close = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    /* Sync theme across tabs */
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

    return (
        <header className="header">
            <div className="header-left">
                <button
                    type="button"
                    className="icon-btn mobile-menu-btn"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </button>

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

                {/* ── Notifications ── */}
                <div className="notif-container" ref={notifRef}>
                    <button
                        type="button"
                        className={`icon-btn notif-btn${unreadCount > 0 ? " has-unread" : ""}`}
                        onClick={openNotif}
                        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                        aria-haspopup="true"
                        aria-expanded={showNotif}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="notif-badge">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                            <div className="notif-panel-header">
                                <span className="notif-panel-title">Notifications</span>

                                {/* Browser alert toggle */}
                                {notifPermission !== "unsupported" && (
                                    <div className="tooltip-wrapper notif-alert-toggle">
                                        <button
                                            type="button"
                                            className={`notif-enable-btn notif-enable-btn--${notifPermission}`}
                                            onClick={requestPermission}
                                            aria-label={
                                                notifPermission === "granted"
                                                    ? "Browser alerts are on"
                                                    : notifPermission === "denied"
                                                    ? "Browser alerts blocked — click for help"
                                                    : "Enable browser alerts"
                                            }
                                        >
                                            <span className="notif-enable-icon">
                                                {notifPermission === "granted" ? "🔔" : "🔕"}
                                            </span>
                                            <span className="notif-enable-label">
                                                {notifPermission === "granted"
                                                    ? "Alerts on"
                                                    : notifPermission === "denied"
                                                    ? "Blocked"
                                                    : "Enable alerts"}
                                            </span>
                                        </button>
                                        <span className="tooltip-box tooltip-box--down">
                                            {notifPermission === "granted"
                                                ? "Browser notifications active. Click to check status."
                                                : notifPermission === "denied"
                                                ? "Blocked by browser. Click for instructions to re-enable."
                                                : "Click to allow browser pop-up alerts for new leads."}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <Bell size={28} strokeWidth={1.5} />
                                        <p>No new notifications</p>
                                        <span>New lead assignments will appear here</span>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notif-item${n.read ? "" : " unread"}`}
                                            onClick={() => {
                                                navigate(n.navPath || `/leads/buyleadfollowup/${n.leadId}`);
                                                setShowNotif(false);
                                            }}
                                        >
                                            <div className="notif-item-dot" />
                                            <div className="notif-item-body">
                                                <div className="notif-item-header-row">
                                                    <span className={`notif-source-badge notif-source-badge--${n.sourceId}`}>
                                                        {n.sourceLabel}
                                                    </span>
                                                    <span className="notif-item-time">{timeAgo(n.timestamp)}</span>
                                                </div>
                                                <div className="notif-item-title">
                                                    {n.customer} — Lead #{n.leadId}
                                                </div>
                                                {n.vehicle && (
                                                    <div className="notif-item-sub">{n.vehicle}</div>
                                                )}
                                                {n.mobile && (
                                                    <div className="notif-item-sub">{n.mobile}</div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="notif-item-close"
                                                aria-label="Dismiss"
                                                onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="notif-panel-footer">
                                    <button
                                        type="button"
                                        className="notif-view-all"
                                        onClick={() => {
                                            navigate("/leads/buyleadfollowuplist");
                                            setShowNotif(false);
                                        }}
                                    >
                                        View all assigned leads →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── User avatar + dropdown ── */}
                <div className="user-menu-wrap" ref={userMenuRef}>
                    <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => !loading && setShowUserMenu(v => !v)}
                        aria-haspopup="true"
                        aria-expanded={showUserMenu}
                        aria-label="User menu"
                    >
                        {loading ? (
                            <Skeleton circle width={36} height={36} />
                        ) : (
                            <div
                                className="header-avatar"
                                style={{ background: avatarColor }}
                                title={displayName}
                            >
                                {initials}
                            </div>
                        )}

                        <div className="header-user-info">
                            {loading ? (
                                <Skeleton width={80} height={12} />
                            ) : (
                                <>
                                    <div className="header-user-name">{displayName || "—"}</div>
                                    {displayRole && (
                                        <div className="header-user-role">{displayRole}</div>
                                    )}
                                </>
                            )}
                        </div>

                        {!loading && (
                            <ChevronDown
                                size={14}
                                className={`user-chevron${showUserMenu ? " open" : ""}`}
                            />
                        )}
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown" role="menu">
                            <div className="user-dropdown-profile">
                                <div
                                    className="user-dropdown-avatar"
                                    style={{ background: avatarColor }}
                                >
                                    {initials}
                                </div>
                                <div className="user-dropdown-info">
                                    <div className="user-dropdown-name">{displayName || "—"}</div>
                                    {displayRole && (
                                        <div className="user-dropdown-role">{displayRole}</div>
                                    )}
                                </div>
                            </div>

                            <div className="user-dropdown-divider" />

                            <button
                                type="button"
                                className="user-dropdown-item logout-item"
                                onClick={logout}
                                role="menuitem"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
