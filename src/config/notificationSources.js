/**
 * Notification sources.
 *
 * PRIMARY path — WebSocket: server pushes
 *   { "sourceId": "<id>", "lead": { id, customerName, mobile, telecaller, executive, make, model, year } }
 *
 * FALLBACK path — polling (30 s) used when WS is unavailable.
 *   fetch / params / getItems / detectDeparture are used only by the polling path.
 */

import { getBuyFollowupLeads } from "../api/services";

const customerOf = (it) => it.customerName || `Lead #${it.id}`;
const vehicleOf  = (it) => [it.make, it.model, it.year].filter(Boolean).join(" ");
const listNames  = (items) =>
    items.slice(0, 3).map(customerOf).join(", ") +
    (items.length > 3 ? ` +${items.length - 3} more` : "");

export const NOTIFICATION_SOURCES = [
    {
        id:       "fresh_allocation",
        label:    "New Lead",
        navPath:  "/leads/buyleadfollowuplist",
        toTitle:  (items) => items.length === 1
            ? `New lead assigned — ${customerOf(items[0])}`
            : `${items.length} new leads assigned to you`,
        toBody:   (items) => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        /* polling fallback */
        params:   { buy_stage: "Fresh", limit: 20, sort_by: "id", sort_order: "desc" },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
    },
    {
        id:       "reallocation",
        label:    "Reallocated",
        navPath:  "/leads/buyleadfollowuplist",
        toTitle:  (items) => items.length === 1
            ? `Lead reallocated to you — ${customerOf(items[0])}`
            : `${items.length} leads reallocated to you`,
        toBody:   (items) => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        /* polling fallback */
        params:   { buy_stage: "UnderFollowup", limit: 20, sort_by: "id", sort_order: "desc" },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
    },
    {
        id:       "reopen",
        label:    "Reopened",
        navPath:  "/leads/buyleadfollowuplist",
        toTitle:  (items) => items.length === 1
            ? `Lead reopened & assigned to you — ${customerOf(items[0])}`
            : `${items.length} leads reopened and assigned to you`,
        toBody:   (items) => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        /* polling fallback */
        params:   { buy_stage: "Fresh", limit: 100 },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
    },
    {
        id:              "preprice_provided",
        label:           "Pre-Price Ready",
        navPath:         "/leads/buyleadfollowuplist",
        detectDeparture: true,
        toTitle:  (items) => items.length === 1
            ? `Pre-price ready — ${customerOf(items[0])}`
            : `${items.length} leads have pre-price ready`,
        toBody:   (items) => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        /* polling fallback */
        params:   { status: "preprice", limit: 100 },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    =>
            (res.data?.items || []).filter(it => it.status?.toLowerCase() === "preprice"),
    },
];
