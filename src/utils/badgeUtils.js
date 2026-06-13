/** Human-readable labels for API status values */
const STATUS_LABELS = {
    notallocated:  "Not Allocated",
    allocated:     "Allocated",
    appointment:   "Appointment",
    preprice:      "Pre-Price",
    lost:          "Lost",
    dnd:           "DND",
};

const STAGE_LABELS = {
    fresh:         "Fresh",
    underfollowup: "Under Followup",
    appointment:   "Appointment",
    lost:          "Lost",
    dnd:           "DND",
};

export const formatStatus = (status) =>
    status ? (STATUS_LABELS[status.toLowerCase()] ?? status) : "—";

export const formatStage = (stage) =>
    stage ? (STAGE_LABELS[stage.toLowerCase()] ?? stage) : "—";

/** Returns the CSS modifier class (used with .badge) */
export const getStatusClass = (status) => {
    if (!status) return "gray";
    const map = {
        notallocated: "orange",
        allocated:    "purple",
        appointment:  "green",
        preprice:     "orange",
        lost:         "red",
        dnd:          "red",
    };
    return map[status.toLowerCase()] || "gray";
};

export const getStageClass = (stage) => {
    if (!stage) return "gray";
    const map = {
        fresh:         "orange",
        underfollowup: "purple",
        appointment:   "green",
        lost:          "red",
        dnd:           "red",
    };
    return map[stage.toLowerCase()] || "gray";
};

/** Download a CSV blob returned from an API */
export const downloadCsv = (blobData, filename) => {
    const blob = new Blob([blobData], { type: "text/csv;charset=utf-8;" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};
