import { Search, Download, LayoutGrid, Table } from "lucide-react";
import { getBuyLeadExport } from "../../api/services";
import { useState } from "react";

export default function TableToolbar({
    search,
    setSearch,
    view,
    setView,
    showSelectAll = false,
    onSelectAll = () => { },
    isAllSelected = false,
    selectedCount = 0,
}) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await getBuyLeadExport({
                search: search || undefined,
                sort_by: "id",
                sort_order: "desc",
            });

            const blob = new Blob([res.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `buy_leads_${Date.now()}.csv`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="table-toolbar">
            {/* SEARCH */}
            <div className="search-box">
                <Search className="search-icon" size={16} />
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ACTIONS */}
            <div className="toolbar-actions">
                {/* ✅ SELECT ALL (OPTIONAL) */}
                {showSelectAll && (
                    <div className="select-all">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={onSelectAll}
                        />
                        <span>
                            {selectedCount > 0
                                ? `${selectedCount} selected`
                                : "Select All"}
                        </span>
                    </div>
                )}
                {/* VIEW TOGGLE */}
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${view === "table" ? "active" : ""}`}
                        onClick={() => setView("table")}
                    >
                        <Table size={16} />
                    </button>

                    <button
                        className={`toggle-btn ${view === "card" ? "active" : ""}`}
                        onClick={() => setView("card")}
                    >
                        <LayoutGrid size={16} />
                    </button>
                </div>

                {/* EXPORT */}
                <button
                    className="btn-light"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <Download size={16} />
                    {exporting ? "Exporting..." : "Export"}
                </button>
            </div>
        </div>
    );
}
