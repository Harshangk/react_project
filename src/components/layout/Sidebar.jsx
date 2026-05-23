import React, { useEffect, useState } from "react";
import { getMenu } from "../../api/services";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import appConfig from "../../config/appConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Sidebar({ isOpen = false, onClose }) {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const isRouteMatch = (basePath, currentPath) => {
        if (!basePath) return false;

        return (
            currentPath === basePath ||
            currentPath.startsWith(basePath + "/")
        );
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const res = await getMenu();
            setMenu(res.data);
        } catch (err) {
            console.error("Menu fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (menu.length === 0) return;

        const currentPath = location.pathname;

        const activeParent = menu.find((item) =>
            item.children?.some((child) =>
                isRouteMatch(child.menuPath, currentPath)
            )
        );

        if (activeParent) {
            setOpenMenu(activeParent.id);
        } else {
            setOpenMenu(null);
        }
    }, [location.pathname, menu]);

    const goTo = (path) => {
        if (!path) return;

        navigate(path);
        onClose?.();
    };

    const handleClick = (item) => {
        if (item.children?.length > 0) {
            setOpenMenu((prev) => (prev === item.id ? null : item.id));
        } else {
            goTo(item.menuPath);
        }
    };

    const renderIcon = (iconName) => {
        if (!iconName) return null;
        const IconComponent = Icons[iconName];
        return IconComponent ? <IconComponent size={18} /> : null;
    };

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main navigation">
            <div className="sidebar-brand">
                <h2 className="logo">
                    {loading ? (
                        <Skeleton width={150} height={24} />
                    ) : (
                        <>
                            <img
                                src={appConfig.logo}
                                alt="logo"
                                className="logo-img"
                            />
                            {appConfig.appName}
                        </>
                    )}
                </h2>

                <button
                    type="button"
                    className="icon-btn sidebar-close"
                    onClick={onClose}
                    aria-label="Close navigation"
                >
                    <X size={20} />
                </button>
            </div>

            <hr />

            {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} height={30} style={{ marginBottom: "12px" }} />
                ))
            ) : (
                menu.map((item) => {
                    const isChildActive = item.children?.some(
                        (child) => isRouteMatch(child.menuPath, location.pathname)
                    );

                    const isParentActive =
                        isRouteMatch(item.menuPath, location.pathname) || isChildActive;

                    return (
                        <div key={item.id}>
                            <button
                                type="button"
                                className={`menu-item ${isParentActive ? "active" : ""}`}
                                onClick={() => handleClick(item)}
                            >
                                <div className="menu-left">
                                    {renderIcon(item.menuIcon)}
                                    <span>{item.menuName}</span>
                                </div>

                                {item.children?.length > 0 && (
                                    openMenu === item.id
                                        ? <ChevronDown size={16} />
                                        : <ChevronRight size={16} />
                                )}
                            </button>

                            {openMenu === item.id && (
                                <div className="submenu-container">
                                    {item.children?.map((child) => {
                                        const isActive =
                                            isRouteMatch(child.menuPath, location.pathname);

                                        return (
                                            <button
                                                type="button"
                                                key={child.id}
                                                className={`submenu-item ${isActive ? "active" : ""}`}
                                                onClick={() => goTo(child.menuPath)}
                                            >
                                                <span className="submenu-dot"></span>
                                                {child.menuName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </aside>
    );
}

export default Sidebar;
