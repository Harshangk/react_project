import { ChevronLeft, ChevronRight } from "lucide-react";

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
            <div className="pagination-left">
                <span>
                    Page {currentPage} - Total {total} records
                </span>
            </div>

            <div className="pagination-right">
                <div className="rows-dropdown">
                    <span>Rows</span>
                    <select
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="pagination-controls">
                    <button
                        type="button"
                        className="nav-btn"
                        onClick={handlePrev}
                        disabled={!hasPrev}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    <button
                        type="button"
                        className="nav-btn"
                        onClick={handleNext}
                        disabled={!hasNext}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
