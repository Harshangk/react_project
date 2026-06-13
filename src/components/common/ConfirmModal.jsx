import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
    isOpen,
    title = "Delete",
    message = "Are you sure? This action cannot be undone.",
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-box">
                <div className="modal-icon danger">
                    <AlertTriangle size={24} />
                </div>

                <h3 id="modal-title">{title}</h3>
                <p>{message}</p>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
