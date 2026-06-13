import { Search, Download, LayoutGrid, Table } from "lucide-react";
import { useState } from "react";

export default function TableToolbar({
    search,
    setSearch,
    view,
    setView,
    onExport,
    showSelectAll = false,
    onSelectAll   = () => {},
    isAllSelected = false,
    selectedCount = 0,
}) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!onExport || exporting) return;
        setExporting(true);
        try { await onExport(); } finally { setExporting(false); }
    };

    return (
        <div className="table-toolbar">
            {/* Search */}
            <div className="search-box">
                <Search className="search-icon" size={15} />
                <input
                    type="search"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search"
                />
            </div>

            {/* Actions */}
            <div className="toolbar-actions">
                {/* Select all (optional) */}
                {showSelectAll && (
                    <label className="select-all">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={onSelectAll}
                        />
                        <span>{selectedCount > 0 ? `${selectedCount} selected` : "Select All"}</span>
                    </label>
                )}

                {/* View toggle */}
                <div className="view-toggle" role="group" aria-label="Switch view">
                    <button
                        type="button"
                        className={`toggle-btn ${view === "table" ? "active" : ""}`}
                        onClick={() => setView("table")}
                        title="Table view"
                        aria-pressed={view === "table"}
                    >
                        <Table size={15} />
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${view === "card" ? "active" : ""}`}
                        onClick={() => setView("card")}
                        title="Card view"
                        aria-pressed={view === "card"}
                    >
                        <LayoutGrid size={15} />
                    </button>
                </div>

                {/* Export */}
                {onExport && (
                    <button
                        type="button"
                        className="btn-light"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <Download size={14} />
                        {exporting ? "Exporting…" : "Export"}
                    </button>
                )}
            </div>
        </div>
    );
}
