import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMenu } from "../../api/services";
import { useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const isRouteMatch = (basePath, currentPath) =>
    !!basePath && (currentPath === basePath || currentPath.startsWith(basePath + "/"));

function Sidebar({ isOpen = false, onClose }) {
    const [menu, setMenu]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

    const navigate   = useNavigate();
    const location   = useLocation();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        getMenu()
            .then(res => setMenu(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    /* Auto-expand parent whose child matches current route */
    useEffect(() => {
        if (!menu.length) return;
        const active = menu.find(item =>
            item.children?.some(c => isRouteMatch(c.menuPath, location.pathname))
        );
        setOpenMenu(active?.id ?? null);
    }, [location.pathname, menu]);

    /* Close sidebar when route changes (mobile) */
    useEffect(() => { onClose?.(); }, [location.pathname]); // eslint-disable-line

    const goTo = useCallback((path) => {
        if (!path) return;
        navigate(path);
    }, [navigate]);

    const handleParentClick = useCallback((item) => {
        if (item.children?.length > 0) {
            setOpenMenu(prev => (prev === item.id ? null : item.id));
        } else {
            goTo(item.menuPath);
        }
    }, [goTo]);

    const renderIcon = useCallback((iconName) => {
        if (!iconName) return null;
        const Icon = Icons[iconName];
        return Icon ? <Icon size={17} /> : null;
    }, []);

    const menuItems = useMemo(() => menu.map(item => {
        const isChildActive  = item.children?.some(c => isRouteMatch(c.menuPath, location.pathname));
        const isParentActive = isRouteMatch(item.menuPath, location.pathname) || isChildActive;
        const isExpanded     = openMenu === item.id;

        return (
            <div key={item.id}>
                <button
                    type="button"
                    className={`menu-item ${isParentActive ? "active" : ""}`}
                    onClick={() => handleParentClick(item)}
                    aria-expanded={item.children?.length > 0 ? isExpanded : undefined}
                >
                    <div className="menu-left">
                        {renderIcon(item.menuIcon)}
                        <span>{item.menuName}</span>
                    </div>
                    {item.children?.length > 0 && (
                        isExpanded
                            ? <ChevronDown size={14} style={{ flexShrink: 0 }} />
                            : <ChevronRight size={14} style={{ flexShrink: 0 }} />
                    )}
                </button>

                {isExpanded && (
                    <div className="submenu-container" role="group">
                        {item.children.map(child => (
                            <button
                                type="button"
                                key={child.id}
                                className={`submenu-item ${isRouteMatch(child.menuPath, location.pathname) ? "active" : ""}`}
                                onClick={() => goTo(child.menuPath)}
                            >
                                <span className="submenu-dot" aria-hidden="true" />
                                {child.menuName}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }), [menu, location.pathname, openMenu, handleParentClick, renderIcon, goTo]);

    return (
        <aside
            className={`sidebar ${isOpen ? "open" : ""}`}
            aria-label="Main navigation"
            aria-hidden={!isOpen && undefined}
        >
            <div className="sidebar-brand">
                <div className="logo">
                    <div className="jm-badge" aria-hidden="true">JM</div>
                    <span className="jm-brand-name">
                        <span className="jm-accent">Jolly</span>CRM
                    </span>
                </div>

                {/* Close button — visible on mobile overlay mode */}
                <button
                    type="button"
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="sidebar-divider" />

            <nav className="sidebar-inner" aria-label="Site navigation">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} height={36} borderRadius={6} style={{ marginBottom: 4 }} />
                    ))
                    : menuItems
                }
            </nav>
        </aside>
    );
}

export default Sidebar;
