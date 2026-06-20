import { useEffect, useState } from "react";
import { useViewMode } from "../../hooks/useViewMode";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import TableToolbar from "../../components/common/TableToolbar";
import ActionMenu from "../../components/common/ActionMenu";
import { formatDateTime } from "../../utils/formatDate";
import { getBuyImportLeads, downloadImportFile, getBuyImportLeadExport } from "../../api/services";
import { downloadCsv } from "../../utils/badgeUtils";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BuyLeadList() {
    const [downloadingKey, setDownloadingKey] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);

    const [view, setView] = useViewMode();

    const getTrackerClass = (status) => {
        if (!status) return "gray";
        const map = { pending: "orange", complete: "green" };
        return map[status.toLowerCase()] || "gray";
    };

    const formatTrackerStatus = (status) => {
        if (!status) return "—";
        const map = { pending: "Pending", complete: "Complete" };
        return map[status.toLowerCase()] ?? status;
    };

    const handleExport = async () => {
        try {
            const res = await getBuyImportLeadExport({
                search: search || undefined,
                sort_by: "id",
                sort_order: "desc",
            });
            downloadCsv(res.data, `buy_leads_tracker_${Date.now()}.csv`);
            toast.success("Export downloaded");
        } catch {
            toast.error("Export failed. Please try again.");
        }
    };
    const [cursor, setCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [prevStack, setPrevStack] = useState([]);

    const [total, setTotal] = useState(0);

    const fetchImportLeads = async () => {
        try {
            setLoading(true);

            const res = await getBuyImportLeads({
                cursor: cursor,
                limit: pageSize,
                search: search,
                sort_by: "id",
                sort_order: "desc",
            });

            const result = res.data;

            setData(result.items || []);
            setTotal(result.total || 0);

            if (result.next && result.items?.length > 0) {
                const queryString = result.next.split("?")[1];
                const params = new URLSearchParams(queryString);
                const next = params.get("cursor");

                setNextCursor(
                    result.items.length < pageSize ? null : next
                );
            } else {
                setNextCursor(null);
            }


        } catch {
            // silently skip on abort
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            if (search.length === 0 || search.length >= 4) {
                fetchImportLeads();
            }
        }, search ? 500 : 0);

        return () => clearTimeout(delay);
    }, [cursor, pageSize, search]);

    const handleNext = () => {
        if (!nextCursor) return;

        setPrevStack((prev) => [...prev, cursor]);
        setCursor(nextCursor);
    };

    const handlePrev = () => {
        if (prevStack.length === 0) return;

        const stack = [...prevStack];
        const prevCursor = stack.pop();

        setPrevStack(stack);
        setCursor(prevCursor);
    };

    const columns = [
        { key: "id", label: "#" },
        { key: "s3Key", label: "Key" },
        { key: "fileUuid", label: "File UUID" },
        {
            key: "processedRecords",
            label: "Processed",
            render: (row) => {
                const isDownloading = downloadingKey === row.s3Key;

                return (
                    <span
                        style={{
                            color: row.processedRecords ? "#2563eb" : "#9ca3af",
                            cursor:
                                row.processedRecords && !isDownloading
                                    ? "pointer"
                                    : "not-allowed",
                            textDecoration:
                                row.processedRecords && !isDownloading ? "underline" : "none",
                            opacity: isDownloading ? 0.6 : 1,
                        }}
                        onClick={() =>
                            row.processedRecords &&
                            !isDownloading &&
                            handleDownload(row.s3Key, "buyleadfile")
                        }
                    >
                        {isDownloading ? "Downloading..." : row.processedRecords}
                    </span>
                );
            },
        },
        {
            key: "errorRecords",
            label: "Error",
            render: (row) => {
                const isDownloading = downloadingKey === row.errorS3Key;

                return (
                    <span
                        style={{
                            color: row.errorRecords ? "red" : "#9ca3af",
                            cursor:
                                row.errorRecords && !isDownloading
                                    ? "pointer"
                                    : "not-allowed",
                            textDecoration: row.errorRecords ? "underline" : "none",
                            opacity: isDownloading ? 0.6 : 1,
                        }}
                        onClick={() =>
                            row.errorRecords &&
                            !isDownloading &&
                            handleDownload(row.errorS3Key, "errorbuyleadfile")
                        }
                    >
                        {isDownloading ? "Downloading..." : row.errorRecords}
                    </span>
                );
            },
        },

        { key: "errorS3Key", label: "Error Key" },
        {
            key: "created",
            label: "Created",
            render: (row) => `${row.createdBy} - ${formatDateTime(row.createdAt)}`,
        },
        {
            key: "fileStatus",
            label: "Status",
            render: (row) => (
                <span className={`badge ${getTrackerClass(row.fileStatus)}`}>
                    {formatTrackerStatus(row.fileStatus)}
                </span>
            ),
        },
    ];


    const handleDownload = async (fileKey, bucket) => {
        if (!fileKey || downloadingKey === fileKey) return;

        try {
            setDownloadingKey(fileKey);

            const toastId = toast.loading("Downloading file...");

            const res = await downloadImportFile(fileKey, bucket);

            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileKey.split("/").pop();

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success("Download completed");

        } catch {
            toast.error("Download failed");
        } finally {
            setDownloadingKey(null);
        }
    };


    return (
        <MainLayout>
            <div className="content">
                <h3 style={{ marginBottom: "20px" }}>
                    {loading ? <Skeleton width={200} /> : "Leads Tracker"}
                </h3>

                <TableToolbar
                    search={search}
                    setSearch={setSearch}
                    view={view}
                    setView={setView}
                    onExport={handleExport}
                />

                <div className="table-container">
                    {view === "table" ? (
                        <DataTable
                            columns={columns}
                            data={data}
                            loading={loading}
                        />
                    ) : (
                        <div className="card-view">
                            {data.map((row) => (
                                <div key={row.id} className="import-card">

                                    {/* HEADER */}
                                    <div className="import-card-header">
                                        <div>
                                            <div className="import-id">File #{row.id}</div>
                                            <div className="import-uuid">{row.fileUuid}</div>
                                        </div>
                                    </div>

                                    {/* S3 KEY */}
                                    <div className="import-key">
                                        <span>Key</span>
                                        <p title={row.s3Key}>{row.s3Key}</p>
                                    </div>
                                    <div className="import-key">
                                        <span>Error Key</span>
                                        <p title={row.errorS3Key}>{row.errorS3Key}</p>
                                    </div>

                                    {/* STATS */}
                                    <div className="import-stats">

                                        {/* PROCESSED */}
                                        {(() => {
                                            const isDownloading = downloadingKey === row.s3Key;

                                            return (
                                                <div
                                                    className="stat success"
                                                    style={{
                                                        cursor:
                                                            row.processedRecords && !isDownloading
                                                                ? "pointer"
                                                                : "not-allowed",
                                                        opacity: row.processedRecords ? 1 : 0.6,
                                                    }}
                                                    onClick={() =>
                                                        row.processedRecords &&
                                                        !isDownloading &&
                                                        handleDownload(row.s3Key, "buyleadfile")
                                                    }
                                                >
                                                    <div className="stat-value">
                                                        {isDownloading ? "..." : row.processedRecords}
                                                    </div>
                                                    <div className="stat-label">
                                                        {isDownloading ? "Downloading..." : "Processed"}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* ERROR */}
                                        {(() => {
                                            const isDownloading = downloadingKey === row.errorS3Key;

                                            return (
                                                <div
                                                    className="stat error"
                                                    style={{
                                                        cursor:
                                                            row.errorRecords && !isDownloading
                                                                ? "pointer"
                                                                : "not-allowed",
                                                        opacity: row.errorRecords ? 1 : 0.6,
                                                    }}
                                                    onClick={() =>
                                                        row.errorRecords &&
                                                        !isDownloading &&
                                                        handleDownload(row.errorS3Key, "errorbuyleadfile")
                                                    }
                                                >
                                                    <div className="stat-value">
                                                        {isDownloading ? "..." : row.errorRecords}
                                                    </div>
                                                    <div className="stat-label">
                                                        {isDownloading ? "Downloading..." : "Errors"}
                                                    </div>
                                                </div>
                                            );
                                        })()}


                                    </div>

                                    {/* FOOTER */}
                                    <div className="import-footer">
                                        <span className={`badge ${getTrackerClass(row.fileStatus)}`}>
                                            {formatTrackerStatus(row.fileStatus)}
                                        </span>

                                        <span className="import-date">
                                            {row.createdBy} • {formatDateTime(row.createdAt)}
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>



                    )}

                    <Pagination
                        total={total}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        hasNext={!!nextCursor}
                        hasPrev={prevStack.length > 0}
                        currentPage={prevStack.length + 1}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
