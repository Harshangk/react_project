export default function Pagination({
    total,
    pageSize,
    setPageSize,
    handleNext,
    handlePrev,
    hasNext,
    hasPrev,
    currentPage
}) {
    return (
        <div className="pagination">
            {/* LEFT */}
            <div className="pagination-left">
                <span>
                    Page {currentPage} • Total {total} records
                </span>
            </div>

            {/* RIGHT */}
            <div className="pagination-right">
                {/* Rows */}
                <div className="rows-dropdown">
                    <span>Rows</span>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Buttons */}
                <div className="pagination-controls">
                    <button
                        className="nav-btn"
                        onClick={handlePrev}
                        disabled={!hasPrev}
                    >
                        ← Previous
                    </button>

                    <button
                        className="nav-btn"
                        onClick={handleNext}
                        disabled={!hasNext}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
