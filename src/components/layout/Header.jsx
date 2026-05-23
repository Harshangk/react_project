import React, { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "../../api/services";
import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { applyTheme, getPreferredTheme, toggleTheme as switchTheme } from "../../utils/theme";

function Header({ onMenuClick }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [theme, setTheme] = useState(() => getPreferredTheme());

    const notifRef = useRef();

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await getCurrentUser();
            setUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    };

    const handleOutsideClick = (e) => {
        if (notifRef.current && !notifRef.current.contains(e.target)) {
            setShowNotif(false);
        }
    };

    const handleThemeToggle = () => {
        setTheme(switchTheme());
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    useEffect(() => {
        const handleThemeChange = (event) => {
            setTheme(applyTheme(event.detail?.theme || getPreferredTheme()));
        };

        const handleStorageChange = (event) => {
            if (event.key === "theme") {
                setTheme(applyTheme(event.newValue || getPreferredTheme()));
            }
        };

        window.addEventListener("themechange", handleThemeChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("themechange", handleThemeChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <div className="header">
            <div className="header-left">
                <button
                    type="button"
                    className="icon-btn mobile-menu-btn"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </button>

                <input className="search" placeholder="Search..." />
            </div>

            <div className="header-right">
                <button
                    type="button"
                    onClick={handleThemeToggle}
                    className="icon-btn"
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                >
                    {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="notif-container" ref={notifRef}>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setShowNotif(!showNotif)}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                    </button>
                    {showNotif && (
                        <div className="notif-dropdown">
                            <p>No new notifications</p>
                        </div>
                    )}
                </div>

                <div className="user-info">
                    <User size={18} />
                    {loading ? (
                        <Skeleton width={80} />
                    ) : (
                        <span>{user?.userName}</span>
                    )}
                </div>

                <button
                    type="button"
                    className="icon-btn logout"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
}

export default Header;
