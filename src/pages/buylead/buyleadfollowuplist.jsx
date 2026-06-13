import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import TableToolbar from "../../components/common/TableToolbar";
import ActionMenu from "../../components/common/ActionMenu";
import Avatar from "../../components/common/Avatar";
import { formatDateTime } from "../../utils/formatDate";
import { getStatusClass, getStageClass, downloadCsv, formatStatus, formatStage } from "../../utils/badgeUtils";
import { getBuyFollowupLeadStatusCount, getBuyFollowupLeads, getBuyFollowupLeadExport } from "../../api/services";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BuyFollowupLeadList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Fresh");
    const [tabCounts, setTabCounts] = useState({
        Fresh: 0,
        Appointment: 0,
        UnderFollowup: 0,
    });

    const TABS = [
        { key: "Fresh", label: "Fresh" },
        { key: "Appointment", label: "Appointment" },
        { key: "UnderFollowup", label: "Under Followup" },
    ];
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);

    const [view, setView] = useState("table");

    const handleView = (row) => navigate(`/leads/buyleadfollowup/${row.id}`);

    const handleExport = async () => {
        try {
            const res = await getBuyFollowupLeadExport({
                search: search || undefined,
                buy_stage: activeTab,
                sort_by: "id",
                sort_order: "desc",
            });
            downloadCsv(res.data, `followup_leads_${Date.now()}.csv`);
            toast.success("Export downloaded");
        } catch {
            toast.error("Export failed. Please try again.");
        }
    };

    const [cursor, setCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [prevStack, setPrevStack] = useState([]);

    const [total, setTotal] = useState(0);

    const fetchLeads = async (signal) => {
        try {
            setLoading(true);

            const res = await getBuyFollowupLeads({
                cursor: cursor,
                limit: pageSize,
                search: search,
                buy_stage: activeTab,
            });
            if (signal?.aborted) return;
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

    const fetchTabCounts = async () => {
        try {
            const res = await getBuyFollowupLeadStatusCount();

            setTabCounts({
                Fresh: 0,
                Appointment: 0,
                UnderFollowup: 0,
                ...res.data,
            });
        } catch (err) {
            console.error(err);

            setTabCounts({
                Fresh: 0,
                Appointment: 0,
                UnderFollowup: 0,
            });
        }
    };

    useEffect(() => {
        fetchTabCounts();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const delay = setTimeout(() => {
            if (search.length === 0 || search.length >= 3) {
                fetchLeads(controller.signal);
            }
        }, search ? 400 : 0);

        return () => {
            controller.abort();
            clearTimeout(delay);
        };
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

    const columns = [
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
            render: (row) => (
                <span className={`badge ${getStageClass(row.leadFollowup?.stage)}`}>
                    {formatStage(row.leadFollowup?.stage)}
                </span>
            ),
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
            render: (row) => `${formatDateTime(row.leadFollowup.calldate)}`,
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
            render: (row) => `${row.allocatedBy} - ${formatDateTime(row.allocatedAt)}`,
        },
        {
            key: "followup",
            label: "Followup",
            render: (row) => `${row.followupCreatedBy} - ${formatDateTime(row.followupCreatedAt)}`,
        },
        {
            key: "actions",
            label: "Action",
            render: (row) => (
                <ActionMenu
                    onView={() => handleView(row)}
                />
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="content">
                <div className="page-header">
                    <h3>{loading ? <Skeleton width={180} /> : "Followup Leads"}</h3>
                </div>
                <div className="tabs-container">
                    <div className="tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`tab ${activeTab === tab.key ? "active" : ""}`}
                                onClick={() => {
                                    if (activeTab === tab.key) return;

                                    setActiveTab(tab.key);
                                    setCursor(null);
                                    setPrevStack([]);
                                    setNextCursor(null);
                                }}
                            >
                                {tab.label}
                                <span className="tab-badge">
                                    {tabCounts[tab.key]}
                                </span>
                            </button>
                        ))}

                    </div>
                </div>
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
                            {data.map((row) => {
                                const lf = row.leadFollowup || {};

                                return (
                                    <div key={row.id} className="lead-card">

                                        {/* HEADER */}
                                        <div className="card-header">
                                            <div className="left">
                                                <Avatar name={row.customerName} seed={row.id} />
                                                <div>
                                                    <div className="lead-id">#{row.id}</div>
                                                    <div className="customer-name">{row.customerName}</div>
                                                    <div className="mobile">{row.mobile || "-"}</div>
                                                </div>
                                            </div>

                                            <div className="right">
                                                <span className={`badge ${getStatusClass(row.status)}`}>
                                                    {formatStatus(row.status)}
                                                </span>
                                                <ActionMenu onView={() => handleView(row)} />
                                            </div>
                                        </div>

                                        {/* VEHICLE (PRIMARY FOCUS AREA) */}
                                        <div className="card-highlight">
                                            <div className="vehicle-title">
                                                {row.make} - {row.model} - {row.year}
                                            </div>
                                            <div className="vehicle-sub">
                                                {row.fuelType} • {row.kms} kms • {row.owner} owner
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
                                                <span className="badge gray">
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
                                            <span>Created: {row.createdBy} • {formatDateTime(row.createdAt)}</span>
                                            <span>Allocated: {row.allocatedBy} • {formatDateTime(row.allocatedAt)}</span>
                                            <span>Followup: {row.followupCreatedBy} • {formatDateTime(row.followupCreatedAt)}</span>
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
            </div>
        </MainLayout>
    );
}
