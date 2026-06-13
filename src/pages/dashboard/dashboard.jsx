import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getBuyFollowupLeadStatusCount } from "../../api/services";
import { useUser } from "../../context/UserContext";
import {
    Users, Car, ClipboardList, RefreshCcw,
    UserCheck, TrendingUp, PlusCircle, Upload,
    List, AlertCircle, PhoneCall, XCircle,
    RotateCcw, BarChart3, ChevronRight,
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/* ── helpers ─────────────────────────────── */
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

const getTodayLabel = () =>
    new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

/* ── constants ───────────────────────────── */
const QUICK_LINKS = [
    { label: "Add Buy Lead",     icon: PlusCircle,    path: "/leads/buylead",               color: "teal"   },
    { label: "Followup List",    icon: PhoneCall,     path: "/leads/buyleadfollowuplist",    color: "blue"   },
    { label: "All Buy Leads",    icon: List,          path: "/leads/buyleadlist",            color: "green"  },
    { label: "Import Leads",     icon: Upload,        path: "/leads/buyleadimport",          color: "orange" },
    { label: "Import Tracker",   icon: BarChart3,     path: "/leads/buyleadtracker",         color: "purple" },
    { label: "Reallocation",     icon: RefreshCcw,    path: "/leads/reallocationlist",       color: "blue"   },
    { label: "Untouched Leads",  icon: AlertCircle,   path: "/leads/untouchedlist",          color: "red"    },
    { label: "Lost Leads",       icon: XCircle,       path: "/leads/buyleadlostlist",        color: "danger" },
];

/* ── component ───────────────────────────── */
function Dashboard() {
    const navigate = useNavigate();
    const { user, userLoading } = useUser();
    const [counts, setCounts]           = useState(null);
    const [countsLoading, setCountsLoading] = useState(true);
    const [refreshKey, setRefreshKey]   = useState(0);

    const loading = userLoading || countsLoading;

    const load = useCallback(() => {
        setCountsLoading(true);
        getBuyFollowupLeadStatusCount()
            .then(res => setCounts(res.data))
            .catch(() => {})
            .finally(() => setCountsLoading(false));
    }, []);

    useEffect(() => { load(); }, [load, refreshKey]);

    /* ── derived counts ── */
    const fresh       = counts?.Fresh        ?? 0;
    const appt        = counts?.Appointment  ?? 0;
    const followup    = counts?.UnderFollowup ?? 0;
    const total       = fresh + appt + followup;

    const stats = [
        {
            label: "Fresh Leads",    value: fresh,    icon: TrendingUp,    color: "teal",
            sub: "Awaiting first call",    path: "/leads/buyleadlist",
        },
        {
            label: "Appointments",   value: appt,     icon: UserCheck,     color: "green",
            sub: "Scheduled visits",       path: "/leads/buyleadfollowuplist",
        },
        {
            label: "Under Followup", value: followup, icon: PhoneCall,     color: "blue",
            sub: "Active conversations",   path: "/leads/buyleadfollowuplist",
        },
        {
            label: "Total Active",   value: total,    icon: Users,         color: "orange",
            sub: "All active leads",       path: "/leads/buyleadlist",
        },
    ];

    /* ── pipeline bars ── */
    const pipeline = [
        { label: "Fresh",        value: fresh,   color: "#0e7c74", dot: "teal"   },
        { label: "Appointment",  value: appt,    color: "#4f46e5", dot: "blue"   },
        { label: "Followup",     value: followup,color: "#d97706", dot: "orange" },
    ];

    return (
        <MainLayout>
            <div className="content">

                {/* ── Welcome banner ── */}
                <div className="dashboard-welcome">
                    <div className="dashboard-welcome-text">
                        {loading ? (
                            <>
                                <Skeleton width={260} height={30} />
                                <Skeleton width={200} height={15} style={{ marginTop: 6 }} />
                            </>
                        ) : (
                            <>
                                <h2>{getGreeting()}, {user?.userName || "there"} 👋</h2>
                                <p className="dashboard-date">
                                    <Car size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                                    {getTodayLabel()} — Let's close some deals today.
                                </p>
                            </>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={() => setRefreshKey(k => k + 1)}
                            disabled={loading}
                            title="Refresh stats"
                            style={{ height: 38, padding: "0 14px", gap: 6, fontSize: 13 }}
                        >
                            <RotateCcw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className="btn btn-submit"
                            onClick={() => navigate("/leads/buylead")}
                            style={{ height: 38, padding: "0 16px", gap: 6, fontSize: 13 }}
                        >
                            <PlusCircle size={14} />
                            Add Lead
                        </button>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="dashboard-stats">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="stat-card">
                                <Skeleton height={14} width={90} />
                                <Skeleton height={40} width={70} style={{ marginTop: 6 }} />
                                <Skeleton height={12} width={120} style={{ marginTop: 6 }} />
                            </div>
                        ))
                        : stats.map(s => (
                            <button
                                key={s.label}
                                type="button"
                                className="stat-card stat-card-btn"
                                onClick={() => navigate(s.path)}
                                title={`Go to ${s.label}`}
                            >
                                <div className="stat-card-header">
                                    <span className="stat-card-label">{s.label}</span>
                                    <div className={`stat-card-icon ${s.color}`}>
                                        <s.icon size={16} />
                                    </div>
                                </div>
                                <div className="stat-card-value">{s.value}</div>
                                <div className="stat-card-footer">
                                    <span className="stat-card-sub">{s.sub}</span>
                                    <ChevronRight size={13} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                                </div>
                            </button>
                        ))
                    }
                </div>

                {/* ── Bottom grid ── */}
                <div className="dashboard-grid">

                    {/* Quick actions */}
                    <div className="card">
                        <div className="dashboard-section-title">Quick Actions</div>
                        <div className="quick-link-grid">
                            {QUICK_LINKS.map(link => (
                                <button
                                    key={link.path}
                                    type="button"
                                    className={`quick-link quick-link--${link.color}`}
                                    onClick={() => navigate(link.path)}
                                >
                                    <div className="quick-link-icon">
                                        <link.icon size={15} />
                                    </div>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Lead pipeline */}
                        <div className="card">
                            <div className="dashboard-section-title">Lead Pipeline</div>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <Skeleton height={13} width="60%" />
                                        <Skeleton height={8} borderRadius={999} style={{ marginTop: 6 }} />
                                    </div>
                                ))
                            ) : (
                                <div className="pipeline-list">
                                    {pipeline.map(item => (
                                        <div key={item.label} className="pipeline-row">
                                            <div className="pipeline-row-top">
                                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <span className={`activity-dot ${item.dot}`} />
                                                    <span className="pipeline-label">{item.label}</span>
                                                </div>
                                                <span className="pipeline-count">
                                                    {item.value} <span className="pipeline-pct">({pct(item.value, total)}%)</span>
                                                </span>
                                            </div>
                                            <div className="pipeline-bar-track">
                                                <div
                                                    className="pipeline-bar-fill"
                                                    style={{
                                                        width: `${pct(item.value, total)}%`,
                                                        background: item.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {total === 0 && (
                                        <p style={{ color: "var(--text-subtle)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                                            No active leads
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Summary strip */}
                        <div className="card">
                            <div className="dashboard-section-title">Today's Summary</div>
                            <div className="summary-grid">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} height={54} borderRadius={8} />
                                    ))
                                ) : (
                                    <>
                                        <div className="summary-cell summary-cell--teal">
                                            <div className="summary-cell-value">{fresh}</div>
                                            <div className="summary-cell-label">Fresh</div>
                                        </div>
                                        <div className="summary-cell summary-cell--green">
                                            <div className="summary-cell-value">{appt}</div>
                                            <div className="summary-cell-label">Appt</div>
                                        </div>
                                        <div className="summary-cell summary-cell--blue">
                                            <div className="summary-cell-value">{followup}</div>
                                            <div className="summary-cell-label">Followup</div>
                                        </div>
                                        <div className="summary-cell summary-cell--orange">
                                            <div className="summary-cell-value">{total}</div>
                                            <div className="summary-cell-label">Total</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default Dashboard;
