import { useMemo } from "react";

const fmtLakh   = (v) => `₹${(v / 100_000).toFixed(1)}L`;
const fmtLabel  = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function buildPoints(items) {
    if (!items?.length) return [];
    const sorted = [...items].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

    const pts = [{
        label: "Initial",
        cep:   sorted[0].prevClientOffer,
        jmq:   sorted[0].prevOurOffer,
        isInitial: true,
    }];

    sorted.forEach(item => pts.push({
        label:     fmtLabel(item.changedAt),
        cep:       item.newClientOffer,
        jmq:       item.newOurOffer,
        changedBy: item.changedBy,
    }));

    return pts;
}

export default function PricingTimeline({ items = [], loading = false }) {
    const points = useMemo(() => buildPoints(items), [items]);

    if (loading) {
        return (
            <p style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                Loading price history…
            </p>
        );
    }
    if (!points.length) {
        return (
            <p style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No price negotiation history yet.
            </p>
        );
    }

    /* ── SVG chart geometry ── */
    const W = 500, H = 185;
    const PL = 54, PR = 14, PT = 14, PB = 32;
    const cW = W - PL - PR, cH = H - PT - PB;
    const N  = points.length;

    const allVals  = points.flatMap(p => [p.cep, p.jmq]);
    const rawMin   = Math.min(...allVals);
    const rawMax   = Math.max(...allVals);
    const rng      = Math.max(rawMax - rawMin, 10000);
    const yMin     = rawMin - rng * 0.18;
    const yMax     = rawMax + rng * 0.18;

    const xOf = (i) => PL + (N === 1 ? cW / 2 : (i / (N - 1)) * cW);
    const yOf = (v) => PT + (1 - (v - yMin) / (yMax - yMin)) * cH;

    const TICKS  = 4;
    const yTicks = Array.from({ length: TICKS }, (_, i) => {
        const v = yMin + (i / (TICKS - 1)) * (yMax - yMin);
        return { y: yOf(v), v };
    }).reverse();

    const cepPoly  = points.map((p, i) => `${xOf(i)},${yOf(p.cep)}`).join(" ");
    const jmqPoly  = points.map((p, i) => `${xOf(i)},${yOf(p.jmq)}`).join(" ");
    const fillPath = [
        ...points.map((p, i) => `${xOf(i)},${yOf(p.cep)}`),
        ...[...points].reverse().map((p, i) => `${xOf(N - 1 - i)},${yOf(p.jmq)}`),
    ].join(" ");

    /* ── Gap data ── */
    const gapPts  = points.map(p => ({
        ...p,
        gap: p.isInitial ? null : ((p.cep - p.jmq) / p.jmq * 100),
    }));
    const maxGap     = Math.max(...gapPts.map(g => g.gap ?? 0), 1);
    const latestGap  = gapPts.filter(g => g.gap !== null).at(-1);
    const gapColor   = (pct) => pct > 12 ? "#ef4444" : pct > 6 ? "#f97316" : "#f59e0b";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-main)" }}>
                    Pricing timeline · CEP vs JM Quote
                </span>
                <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 16, height: 2.5, background: "#ef4444", display: "inline-block", borderRadius: 2 }} />
                        CEP (customer)
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 16, height: 2.5, background: "#3b82f6", display: "inline-block", borderRadius: 2 }} />
                        JM quote (ours)
                    </span>
                </div>
            </div>

            {/* ── SVG line chart ── */}
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
                {yTicks.map(({ y, v }, i) => (
                    <g key={i}>
                        <line x1={PL} y1={y} x2={W - PR} y2={y}
                            stroke="var(--border-color)" strokeWidth={0.7} strokeDasharray="3 3" />
                        <text x={PL - 5} y={y + 3.5} textAnchor="end"
                            fontSize={9.5} fill="var(--text-muted)" fontFamily="inherit">
                            {fmtLakh(v)}
                        </text>
                    </g>
                ))}

                <polygon points={fillPath} fill="rgba(59,130,246,0.08)" />

                <polyline points={cepPoly} fill="none" stroke="#ef4444" strokeWidth={2.2}
                    strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={jmqPoly} fill="none" stroke="#3b82f6" strokeWidth={2.2}
                    strokeLinejoin="round" strokeLinecap="round" />

                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={xOf(i)} cy={yOf(p.cep)} r={3.5} fill="#ef4444" />
                        <circle cx={xOf(i)} cy={yOf(p.jmq)} r={3.5} fill="#3b82f6" />
                        <text x={xOf(i)} y={H - PB + 14} textAnchor="middle"
                            fontSize={9.5} fill="var(--text-muted)" fontFamily="inherit">
                            {p.label}
                        </text>
                    </g>
                ))}
            </svg>

            {/* ── Negotiation gap ── */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-main)" }}>
                        Negotiation gap · CEP – JM Quote
                    </span>
                    {latestGap && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Latest gap:&nbsp;
                            <strong style={{ color: "#ef4444" }}>{latestGap.gap.toFixed(1)}%</strong>
                        </span>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {gapPts.map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                            <div style={{
                                width: 70, height: 15, borderRadius: 3,
                                background: "var(--bg-main)", flexShrink: 0, overflow: "hidden",
                            }}>
                                {p.gap !== null && (
                                    <div style={{
                                        height: "100%",
                                        width: `${Math.min(100, (p.gap / maxGap) * 100)}%`,
                                        background: gapColor(p.gap),
                                        borderRadius: 3,
                                    }} />
                                )}
                            </div>
                            <span style={{ width: 72, flexShrink: 0, fontSize: 12, color: "var(--text-muted)" }}>
                                {p.label}
                            </span>
                            <span style={{ fontWeight: 600, color: p.gap !== null ? "#ef4444" : "var(--text-muted)" }}>
                                {p.gap !== null ? `+${p.gap.toFixed(1)}%` : "—"}
                            </span>
                        </div>
                    ))}
                </div>

                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
                    Positive % = customer asking above our quote. Trend converging to zero means alignment.
                </p>
            </div>
        </div>
    );
}
