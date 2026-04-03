// import { useState, useRef, useEffect } from "react";
// import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

// export default function ActionMenu({ onView, onEdit, onDelete, showView = true, showEdit = true, showDelete = true, }) {
//     const [open, setOpen] = useState(false);
//     const ref = useRef();

//     // 🔥 Close on outside click
//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (ref.current && !ref.current.contains(e.target)) {
//                 setOpen(false);
//             }
//         };

//         document.addEventListener("click", handleClickOutside);
//         return () => document.removeEventListener("click", handleClickOutside);
//     }, []);

//     return (
//         <div className="action-menu" ref={ref}>
//             {/* 3 DOT BUTTON */}
//             <button
//                 className="action-btn"
//                 onClick={() => setOpen(!open)}
//             >
//                 <MoreVertical size={18} />
//             </button>

//             {/* DROPDOWN */}
//             {open && (
//                 <div className="action-dropdown">

//                     {showView && onView && (
//                         <button onClick={onView}>
//                             <Eye size={14} /> View
//                         </button>
//                     )}

//                     {showEdit && onEdit && (
//                         <button onClick={onEdit}>
//                             <Pencil size={14} /> Edit
//                         </button>
//                     )}

//                     {showDelete && onDelete && (
//                         <button className="danger" onClick={onDelete}>
//                             <Trash2 size={14} /> Delete
//                         </button>
//                     )}

//                 </div>
//             )}
//         </div>
//     );
// }


import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

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

    // 🔥 Toggle dropdown + calculate position
    const handleToggle = () => {
        if (!open) {
            const rect = btnRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right - 150, // adjust width
            });
        }
        setOpen(!open);
    };

    // 🔥 Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (btnRef.current && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <>
            {/* BUTTON */}
            <button
                ref={btnRef}
                className="action-btn"
                onClick={handleToggle}
            >
                <MoreVertical size={18} />
            </button>

            {/* 🔥 DROPDOWN VIA PORTAL */}
            {open &&
                createPortal(
                    <div
                        className="action-dropdown"
                        style={{
                            maxWidth: "fit-content",
                            position: "absolute",
                            top: position.top,
                            left: position.left,
                            zIndex: 9999,
                        }}
                    >
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
                    </div>,
                    document.body
                )}
        </>
    );
}
