import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function ActionMenu({
    onView,
    onEdit,
    onDelete,
    showView   = true,
    showEdit   = true,
    showDelete = true,
    extraActions = [],   /* [{ label, icon, onClick, className? }] */
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const btnRef = useRef();

    const handleToggle = () => {
        if (!open) {
            const rect = btnRef.current.getBoundingClientRect();
            setPosition({
                top:  rect.bottom + window.scrollY + 4,
                left: Math.max(8, rect.right + window.scrollX - 150),
            });
        }
        setOpen(c => !c);
    };

    useEffect(() => {
        const close = (e) => {
            if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    const hasItems = (showView && onView) || (showEdit && onEdit) || (showDelete && onDelete) || extraActions.length > 0;
    if (!hasItems) return null;

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className="action-btn"
                onClick={handleToggle}
                aria-label="Open row actions"
            >
                <MoreVertical size={18} />
            </button>

            {open && createPortal(
                <div
                    className="action-dropdown"
                    style={{ position: "absolute", top: position.top, left: position.left, zIndex: 9999 }}
                >
                    {showView && onView && (
                        <button type="button" onClick={() => { onView(); setOpen(false); }}>
                            <Eye size={14} /> View
                        </button>
                    )}
                    {showEdit && onEdit && (
                        <button type="button" onClick={() => { onEdit(); setOpen(false); }}>
                            <Pencil size={14} /> Edit
                        </button>
                    )}
                    {extraActions.map((action, i) => (
                        <button
                            key={i}
                            type="button"
                            className={action.className ?? ""}
                            onClick={() => { action.onClick(); setOpen(false); }}
                        >
                            {action.icon} {action.label}
                        </button>
                    ))}
                    {showDelete && onDelete && (
                        <button type="button" className="danger" onClick={() => { onDelete(); setOpen(false); }}>
                            <Trash2 size={14} /> Delete
                        </button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
