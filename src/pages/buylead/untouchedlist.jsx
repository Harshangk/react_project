import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import TableToolbar from "../../components/common/TableToolbar";
import ActionMenu from "../../components/common/ActionMenu";
import Avatar from "../../components/common/Avatar";
import { formatDateTime } from "../../utils/formatDate";
import FormSelectSearch from "../../components/common/FormSelectSearch";
import { getBuyLeads, deleteBuyLead, getUser, patchBuyLeadAllocation } from "../../api/services";
import ConfirmModal from "../../components/common/ConfirmModal";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BuyUntouchedList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("NotAllocated");
    const [pageSize, setPageSize] = useState(10);

    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [executive, setExecutives] = useState([]);
    const [telecaller, setTelecallers] = useState([]);

    const { control, watch, reset, formState: { errors } } = useForm();

    const selectedTelecaller = watch("telecaller");
    const selectedExecutive = watch("executive");

    const getOptionalLabel = (options, value) => {
        if (!value) return null;
        return options.find(opt => opt.value === value)?.label || null;
    };

    const mapUser = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.userName,
        }));
    const [view, setView] = useState("table");

    useEffect(() => {
        const fetchEnums = async () => {
            try {
                const [exeRes, telRes] = await Promise.all([
                    getUser(1),
                    getUser(1),
                ]);

                setExecutives(mapUser(exeRes?.data?.items));
                setTelecallers(mapUser(telRes?.data?.items));

            } catch (err) {
                console.error("API error:", err);
            } finally {
                setLoading(false);
            }
        };
        console.log("API CALLED");
        fetchEnums();
    }, []);

    const getStatusClass = (status) => {
        if (!status) return "badge";

        const map = {
            notallocated: "badge orange",
            allocated: "badge green",
            lost: "badge red",
        };

        return map[status.toLowerCase()] || "badge gray";
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
                buy_status: status,
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
    }, [cursor, pageSize, search, status]);

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

    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id) // uncheck
                : [...prev, id] // check
        );
    };

    const handleSelectAll = () => {
        const currentPageIds = data.map((row) => row.id);

        const allSelected = currentPageIds.every((id) =>
            selectedIds.includes(id)
        );

        if (allSelected) {
            // unselect all
            setSelectedIds((prev) =>
                prev.filter((id) => !currentPageIds.includes(id))
            );
        } else {
            // select all
            setSelectedIds((prev) => [
                ...new Set([...prev, ...currentPageIds]),
            ]);
        }
    };

    const handleAllocate = async () => {
        if (selectedIds.length === 0) {
            toast.error("Please select at least one record");
            return;
        }
        if (!selectedTelecaller && !selectedExecutive) {
            toast.error("Select Telecaller or Executive");
            return;
        }
        const payload = {
            leadIds: selectedIds,
            telecaller: getOptionalLabel(telecaller, selectedTelecaller),
            executive: getOptionalLabel(executive, selectedExecutive),
        };

        console.log("Payload:", payload);
        try {
            const res = await patchBuyLeadAllocation(payload);
            toast.success(res?.data?.message || "Success");
            fetchLeads();
            setSelectedIds([]);
            reset({
                telecaller: null,
                executive: null
            });
        } catch (err) {
            console.error("Submit error:", err);
            const errorMessage =
                err?.response?.data?.message || "Something went wrong";
            toast.error(errorMessage);
        }
    };
    console.log("Selected IDs:", selectedIds)
    const columns = [
        {
            key: "select",
            label: (
                <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                        data.length > 0 &&
                        data.every((row) => selectedIds.includes(row.id))
                    }
                />
            ),
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                />
            ),
        },
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
                    showView={false}
                    showEdit={false}
                    showDelete={true}
                    onDelete={() => handleDeleteClick(row)}
                />
            ),
        },
    ];

    return (

        < MainLayout >
            <div className="content">
                <h2 style={{ marginBottom: "20px" }}>
                    {loading ? <Skeleton width={200} /> : "Untouched Buy Lead Lists"}
                </h2>
                <TableToolbar
                    search={search}
                    setSearch={setSearch}
                    view={view}
                    setView={setView}
                    showSelectAll={true}
                    onSelectAll={handleSelectAll}
                    isAllSelected={
                        data.length > 0 &&
                        data.every((row) => selectedIds.includes(row.id))
                    }
                    selectedCount={selectedIds.length}
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

                                    {/* HEADER */}
                                    <div className="card-header">
                                        <div className="left">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                            <Avatar name={row.customerName} seed={row.id} />
                                            <div>
                                                <div className="lead-id">#{row.id}</div>
                                                <div className="customer-name">{row.customerName}</div>
                                            </div>
                                        </div>

                                        <ActionMenu
                                            showView={false}
                                            showEdit={false}
                                            showDelete={true}
                                            onDelete={() => handleDeleteClick(row)}
                                        />
                                    </div>

                                    {/* BODY */}
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
                <form
                    className="card"
                    style={{ width: "100%", marginTop: "20px" }}
                >
                    <div className="form-grid">
                        {loading ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} height={40} style={{ marginBottom: "12px" }} />
                            ))
                        ) : (
                            <>
                                <FormSelectSearch
                                    label="Telecaller"
                                    name="telecaller"
                                    control={control}
                                    options={telecaller}
                                    rules={{ required: "Telecaller is required" }}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Executive"
                                    name="executive"
                                    control={control}
                                    options={executive}
                                    rules={{ required: "Executive is required" }}
                                    errors={errors}
                                />
                            </>
                        )}
                    </div>
                    <div className="form-actions">

                        {loading ? (
                            <Skeleton height={45} width={120} />
                        ) : (
                            <>
                                <div className="tooltip-wrapper">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={
                                            !selectedIds.length ||
                                            selectedIds.length > 100 ||
                                            (!selectedTelecaller && !selectedExecutive)
                                        }
                                        onClick={handleAllocate}
                                    >
                                        Allocate
                                    </button>

                                    {/* TOOLTIP */}
                                    {(
                                        !selectedIds.length ||
                                        selectedIds.length > 100 ||
                                        (!selectedTelecaller && !selectedExecutive)
                                    ) && (
                                            <div className="tooltip-box">
                                                {!selectedIds.length
                                                    ? "Select at least one record"
                                                    : selectedIds.length > 100
                                                        ? "Maximum 100 records allowed"
                                                        : "Select Telecaller or Executive"}
                                            </div>
                                        )}
                                </div>
                                <div className="tooltip-wrapper">
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={() => navigate("/leads/untouchedlist")}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
                <ConfirmModal
                    isOpen={!!deleteId}
                    title="Delete Lead"
                    message={`Are you sure you want to delete lead #${deleteId}?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    loading={deleteLoading}
                />
            </div>
        </MainLayout >
    );
}
