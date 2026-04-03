import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

export default function ActionMenu({ onView, onEdit, onDelete, showView = true, showEdit = true, showDelete = true, }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // 🔥 Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="action-menu" ref={ref}>
            {/* 3 DOT BUTTON */}
            <button
                className="action-btn"
                onClick={() => setOpen(!open)}
            >
                <MoreVertical size={18} />
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="action-dropdown">

                    {showView && onView && (
                        <button onClick={onView}>
                            <Eye size={14} /> View
                        </button>
                    )}

                    {showEdit && onEdit && (
                        <button onClick={onEdit}>
                            <Pencil size={14} /> Edit
                        </button>
                    )}

                    {showDelete && onDelete && (
                        <button className="danger" onClick={onDelete}>
                            <Trash2 size={14} /> Delete
                        </button>
                    )}

                </div>
            )}
        </div>
    );
}
