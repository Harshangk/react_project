import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function ActionMenu({
    onView,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const btnRef = useRef();

    const handleToggle = () => {
        if (!open) {
            const rect = btnRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: Math.max(8, rect.right + window.scrollX - 150),
            });
        }

        setOpen((current) => !current);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (btnRef.current && !btnRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

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

            {open &&
                createPortal(
                    <div
                        className="action-dropdown"
                        style={{
                            position: "absolute",
                            top: position.top,
                            left: position.left,
                            zIndex: 9999,
                        }}
                    >
                        {showView && onView && (
                            <button type="button" onClick={onView}>
                                <Eye size={14} /> View
                            </button>
                        )}

                        {showEdit && onEdit && (
                            <button type="button" onClick={onEdit}>
                                <Pencil size={14} /> Edit
                            </button>
                        )}

                        {showDelete && onDelete && (
                            <button type="button" className="danger" onClick={onDelete}>
                                <Trash2 size={14} /> Delete
                            </button>
                        )}
                    </div>,
                    document.body
                )}
        </>
    );
}
