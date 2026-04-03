import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import TableToolbar from "../../components/common/TableToolbar";
import ActionMenu from "../../components/common/ActionMenu";
import Avatar from "../../components/common/Avatar";
import { formatDateTime } from "../../utils/formatDate";
import { getBuyLeads, deleteBuyLead } from "../../api/services";
import ConfirmModal from "../../components/common/ConfirmModal";
import { toast } from "react-toastify";

export default function BuyLeadList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);

    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [view, setView] = useState("table");

    const getStatusClass = (status) => {
        if (!status) return "badge";

        const map = {
            notallocated: "badge orange",
            allocated: "badge green",
            lost: "badge red",
        };

        return map[status.toLowerCase()] || "badge gray";
    };

    const handleEdit = (row) => {
        navigate(`/leads/buylead/${row.id}`);
    };

    const handleDeleteClick = (row) => {
        setDeleteId(row.id); // open modal
    };

    const confirmDelete = async () => {
        try {
            setDeleteLoading(true);

            const res = await deleteBuyLead(deleteId);

            toast.success(res?.data?.message || "Deleted successfully");

            setDeleteId(null); // close modal
            fetchLeads();

        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
    };


    const [cursor, setCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [prevStack, setPrevStack] = useState([]);

    const [total, setTotal] = useState(0);

    const fetchLeads = async () => {
        try {
            setLoading(true);

            const res = await getBuyLeads({
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


        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            if (search.length === 0 || search.length >= 4) {
                fetchLeads();
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
        { key: "branch", label: "Branch" },
        { key: "mobile", label: "Mobile" },
        {
            key: "customerName",
            label: "Customer",
            render: (row) => (
                <div className="name-cell">
                    <Avatar name={row.customerName} seed={row.id} />
                    <span>{row.customerName}</span>
                </div>
            ),
        },
        {
            key: "car",
            label: "Car",
            render: (row) => `${row.make} - ${row.model} - ${row.fuelType} - ${row.year}`,
        },
        { key: "kms", label: "Kms" },
        { key: "owner", label: "Owner" },
        { key: "source", label: "Source" },
        { key: "mode", label: "Mode" },
        { key: "telecaller", label: "Telecaller" },
        { key: "executive", label: "Executive" },
        {
            key: "created",
            label: "Created",
            render: (row) => `${row.createdBy} - ${formatDateTime(row.createdAt)}`,
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span className={`badge ${getStatusClass(row.status)}`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: "actions",
            label: "#",
            render: (row) => (
                <ActionMenu
                    onView={() => console.log("View", row)}
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDeleteClick(row)}
                />
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="content">
                <h2 className="page-title">Buy Lead List</h2>

                <TableToolbar
                    search={search}
                    setSearch={setSearch}
                    view={view}
                    setView={setView}
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
                                <div key={row.id} className="lead-card">

                                    {/* TOP */}
                                    <div className="card-header">
                                        <div className="left">
                                            <Avatar name={row.customerName} seed={row.id} />
                                            <div>
                                                <div className="lead-id">#{row.id}</div>
                                                <div className="customer-name">{row.customerName}</div>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <ActionMenu
                                                onView={() => console.log("View", row)}
                                                onEdit={() => handleEdit(row)}
                                                onDelete={() => handleDeleteClick(row)}
                                            />
                                        </div>
                                    </div>

                                    {/* MAIN INFO */}
                                    <div className="card-body">

                                        <div className="card-row">
                                            <span>{row.mobile}</span>
                                        </div>

                                        <div className="card-row highlight">
                                            {row.make} - {row.model}
                                        </div>

                                        <div className="card-sub">
                                            {row.fuelType} • {row.year} • {row.kms} kms
                                        </div>

                                        <div className="card-meta">
                                            <span>{row.branch}</span>
                                            <span>{row.source}</span>
                                        </div>

                                    </div>

                                    {/* FOOTER */}
                                    <div className="card-footer">
                                        <span className={`badge ${getStatusClass(row.status)}`}>
                                            {row.status}
                                        </span>

                                        <span className="date">
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
                <ConfirmModal
                    isOpen={!!deleteId}
                    title="Delete Lead"
                    message={`Are you sure you want to delete lead #${deleteId}?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    loading={deleteLoading}
                />
            </div>
        </MainLayout>
    );
}
