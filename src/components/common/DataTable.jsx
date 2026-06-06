import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function DataTable({ columns = [], data = [], loading = false }) {
    const stickyWidths = {
        select: 48,
        id: 68,
        actions: 64,
    };

    const getColumnRole = (column) => {
        const key = String(column.key || "").toLowerCase();

        if (column.role) return column.role;
        if (key === "select" || key === "checkbox") return "select";
        if (key === "id") return "id";
        if (key === "actions" || key === "action") return "actions";

        return "";
    };

    const preparedColumns = columns
        .map((column, originalIndex) => ({
            ...column,
            originalIndex,
            role: getColumnRole(column),
        }))
        .sort((a, b) => {
            const order = { select: 0, id: 1, actions: 2 };
            const aOrder = Object.prototype.hasOwnProperty.call(order, a.role)
                ? order[a.role]
                : 10 + a.originalIndex;
            const bOrder = Object.prototype.hasOwnProperty.call(order, b.role)
                ? order[b.role]
                : 10 + b.originalIndex;

            return aOrder - bOrder;
        });

    let stickyLeft = 0;
    const displayColumns = preparedColumns.map((column) => {
        const isSticky = ["select", "id", "actions"].includes(column.role);
        const width = column.width || stickyWidths[column.role];
        const stickyColumn = {
            ...column,
            isSticky,
            width,
            stickyLeft: isSticky ? stickyLeft : undefined,
        };

        if (isSticky) stickyLeft += width;

        return stickyColumn;
    });

    const getCellClassName = (column) => [
        column.className,
        column.role ? `cell-${column.role}` : "",
        column.isSticky ? "cell-sticky" : "",
    ].filter(Boolean).join(" ");

    const getCellStyle = (column) => {
        if (!column.isSticky) return column.style;

        return {
            ...column.style,
            "--sticky-left": `${column.stickyLeft}px`,
            width: `${column.width}px`,
            minWidth: `${column.width}px`,
            maxWidth: `${column.width}px`,
        };
    };

    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                    <tr>
                        {displayColumns.map((col) => (
                            <th
                                key={col.key}
                                className={getCellClassName(col)}
                                style={getCellStyle(col)}
                                scope="col"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                                {displayColumns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={getCellClassName(col)}
                                        style={getCellStyle(col)}
                                    >
                                        <Skeleton height={20} />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={row.id ?? index}>
                                {displayColumns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={getCellClassName(col)}
                                        style={getCellStyle(col)}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={displayColumns.length} className="no-data">
                                No Data Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
