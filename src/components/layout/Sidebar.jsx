import React, { useEffect, useState } from "react";
import { getMenu } from "../../api/services";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import appConfig from "../../config/appConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Sidebar() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const isRouteMatch = (basePath, currentPath) => {
        return (
            currentPath === basePath ||
            currentPath.startsWith(basePath + "/")
        );
    };

    // 🔽 Fetch menu
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

    // ✅ Auto-open based on route (FIXED)
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

    // 🔽 Handle click (FIXED)
    const handleClick = (item) => {
        if (item.children?.length > 0) {
            setOpenMenu((prev) => (prev === item.id ? null : item.id));
        } else if (item.menuPath) {
            setOpenMenu(null); // close on navigation
            navigate(item.menuPath);
        }
    };

    // 🔽 Dynamic icon renderer
    const renderIcon = (iconName) => {
        if (!iconName) return null;
        const IconComponent = Icons[iconName];
        return IconComponent ? <IconComponent size={18} /> : null;
    };

    return (
        <div className="sidebar">
            {/* Logo */}
            <h2 className="logo">
                {loading ? (
                    <Skeleton width={150} height={24} />
                ) : (
                    <>
                        <img
                            src={appConfig.logo}
                            alt="logo"
                            style={{ height: "24px", marginRight: "8px" }}
                        />
                        {appConfig.appName}
                    </>
                )}
            </h2>

            <hr />

            {/* Menu */}
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
                            {/* Parent */}
                            <div
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
                            </div>

                            {/* Children */}
                            {openMenu === item.id && (
                                <div className="submenu-container">
                                    {item.children?.map((child) => {
                                        const isActive =
                                            isRouteMatch(child.menuPath, location.pathname);

                                        return (
                                            <div
                                                key={child.id}
                                                className={`submenu-item ${isActive ? "active" : ""}`}
                                                onClick={() => navigate(child.menuPath)}
                                            >
                                                <span className="submenu-dot"></span>
                                                {child.menuName}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Sidebar;
