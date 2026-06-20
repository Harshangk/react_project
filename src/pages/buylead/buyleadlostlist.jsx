import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useViewMode } from "../../hooks/useViewMode";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import TableToolbar from "../../components/common/TableToolbar";
import ActionMenu from "../../components/common/ActionMenu";
import Avatar from "../../components/common/Avatar";
import { formatDateTime } from "../../utils/formatDate";
import { getStatusClass, getStageClass, formatStatus, formatStage } from "../../utils/badgeUtils";
import FormSelectSearch from "../../components/common/FormSelectSearch";
import { getBuyLeads, deleteBuyLead, getUser, patchBuyLeadReopen } from "../../api/services";
import ConfirmModal from "../../components/common/ConfirmModal";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BuyLeadLostList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Lost");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [tabCounts, setTabCounts] = useState({
        Lost: 0,
        DND: 0,
    });
    const handleTabChange = (tab) => {
        if (tab === activeTab) return; // avoid unnecessary API calls

        setActiveTab(tab);
        setCursor(null);
        setPrevStack([]);
        setSelectedIds([]);
    };
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
    const [view, setView] = useViewMode();

    useEffect(() => {
        const fetchEnums = async () => {
            try {
                const [exeRes, telRes] = await Promise.all([
                    getUser(3),
                    getUser(2),
                ]);

                setExecutives(mapUser(exeRes?.data?.items));
                setTelecallers(mapUser(telRes?.data?.items));

            } catch (err) {
                console.error("API error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEnums();
    }, []);

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
                buy_status: activeTab,
                sort_by: "id",
                sort_order: "desc",
            });

            const result = res.data;

            setData(result.items || []);

            setTotal(result.total || 0);

            setTabCounts((prev) => ({
                ...prev,
                [activeTab]: result.total || 0,
            }));

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
    }, [cursor, pageSize, search, activeTab]);

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

    const handleReopen = async () => {
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
        try {
            const res = await patchBuyLeadReopen(payload);
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
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span className={`badge ${getStatusClass(row.status)}`}>
                    {formatStatus(row.status)}
                </span>
            ),
        },
        {
            key: "stage",
            label: "Stage",
            render: (row) => {
                const stage = row.leadFollowup?.stage;

                return (
                    <span className={`badge ${getStageClass(stage)}`}>
                        {formatStage(stage)}
                    </span>
                );
            },
        },
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
            key: "disposition",
            label: "Disposition",
            render: (row) => (
                <span>
                    {row.leadFollowup?.disposition || "-"}
                </span>
            ),
        },
        {
            key: "callDate",
            label: "Call Date",
            render: (row) => {
                const callDate = row.leadFollowup?.calldate;

                return callDate ? formatDateTime(callDate) : "-";
            },
        },
        {
            key: "car",
            label: "Car",
            render: (row) => `${row.make} - ${row.model} - ${row.fuelType} - ${row.year}`,
        },
        { key: "branch", label: "Branch" },
        { key: "source", label: "Source" },
        { key: "mode", label: "Mode" },
        { key: "kms", label: "Kms" },
        { key: "owner", label: "Owner" },
        { key: "telecaller", label: "Telecaller" },
        { key: "executive", label: "Executive" },
        { key: "clientOffer", label: "Client Offer" },
        { key: "ourOffer", label: "Our Offer" },
        { key: "brokerName", label: "Broker" },
        {
            key: "created",
            label: "Created",
            render: (row) => `${row.createdBy} - ${formatDateTime(row.createdAt)}`,
        },
        {
            key: "allocate",
            label: "Allocate",
            render: (row) => `${row.allocatedBy || "-"} - ${formatDateTime(row.allocatedAt)}`,
        },
        {
            key: "followup",
            label: "Followup",
            render: (row) => `${row.followupCreatedBy || "-"} - ${formatDateTime(row.followupCreatedAt)}`,
        },
        {
            key: "actions",
            label: "Action",
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
                <div className="page-header">
                    <h3>{loading ? <Skeleton width={200} /> : `Search ${activeTab} Leads`}</h3>
                </div>
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "Lost" ? "active" : ""}`}
                            onClick={() => handleTabChange("Lost")}
                        >
                            Lost
                            <span className="tab-badge">{tabCounts.Lost}</span>
                        </button>

                        <button
                            className={`tab ${activeTab === "DND" ? "active" : ""}`}
                            onClick={() => handleTabChange("DND")}
                        >
                            DND
                            <span className="tab-badge">{tabCounts.DND}</span>
                        </button>
                    </div>
                </div>
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
                            {data.map((row) => {
                                const lf = row.leadFollowup || {};
                                return (
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
                                                    <div className="mobile">{row.mobile || "-"}</div>
                                                </div>
                                            </div>
                                            <div className="right">
                                                <span className={`badge ${getStatusClass(row.status)}`}>
                                                    {row.status}
                                                </span>
                                                <ActionMenu
                                                    showView={false}
                                                    showEdit={false}
                                                    showDelete={true}
                                                    onDelete={() => handleDeleteClick(row)}
                                                />
                                            </div>
                                        </div>

                                        {/* VEHICLE (PRIMARY FOCUS AREA) */}
                                        <div className="card-highlight">
                                            <div className="vehicle-title">
                                                {row.make} - {row.model} - {row.year}
                                            </div>
                                            <div className="vehicle-sub">
                                                {row.fuelType} â€¢ {row.kms} kms â€¢ {row.owner} owner
                                            </div>
                                        </div>

                                        {/* META GRID */}
                                        <div className="meta-grid">
                                            <span>Branch: {row.branch || "-"}</span>
                                            <span>Source: {row.source || "-"}</span>
                                            <span>Mode: {row.mode || "-"}</span>
                                            <span>Broker: {row.brokerName || "-"}</span>
                                        </div>

                                        {/* TEAM ASSIGNMENT */}
                                        <div className="team-row">
                                            <span>Telecaller: {row.telecaller || "-"}</span>
                                            <span>Executive: {row.executive || "-"}</span>
                                        </div>

                                        {/* OFFER SECTION */}
                                        <div className="offer-row">
                                            <span>Client Offer: {row.clientOffer || "-"}</span>
                                            <span>Our Offer: {row.ourOffer || "-"}</span>
                                        </div>

                                        {/* FOLLOWUP SECTION */}
                                        <div className="followup-box">

                                            <div className="followup-left">
                                                <span className={`badge ${getStageClass(lf.stage)}`}>
                                                    {formatStage(lf.stage)}
                                                </span>

                                                <span className="badge light">
                                                    {lf.disposition || "-"}
                                                </span>
                                            </div>

                                            <div className="followup-right">
                                                <span className="date">
                                                    {lf.calldate ? formatDateTime(lf.calldate) : "-"}
                                                </span>
                                            </div>

                                        </div>

                                        {/* FOOTER AUDIT */}
                                        <div className="audit-row">
                                            <span>Created: {row.createdBy} â€¢ {formatDateTime(row.createdAt)}</span>
                                            <span>Allocated: {row.allocatedBy} â€¢ {formatDateTime(row.allocatedAt)}</span>
                                            <span>Followup: {row.followupCreatedBy} â€¢ {formatDateTime(row.followupCreatedAt)}</span>
                                        </div>

                                    </div>
                                );
                            })}
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
                                        onClick={handleReopen}
                                    >
                                        Reopen
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
                                        onClick={() => window.location.reload()}
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
