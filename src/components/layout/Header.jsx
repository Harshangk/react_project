import React, { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "../../api/services";
import { Bell, LogOut, User, Moon, Sun } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Header() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotif, setShowNotif] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const notifRef = useRef();

    useEffect(() => {
        fetchUser();

        document.body.className = theme;
        localStorage.setItem("theme", theme);

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [theme]);

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

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <div className="header">
            <input className="search" placeholder="Search..." />

            <div className="header-right">
                <div onClick={toggleTheme} className="icon">
                    {theme === "light" ? <Moon /> : <Sun />}
                </div>

                <div className="notif-container" ref={notifRef}>
                    <Bell className="icon" onClick={() => setShowNotif(!showNotif)} />
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

                <LogOut className="icon logout" onClick={handleLogout} />
            </div>
        </div>
    );
}

export default Header;
