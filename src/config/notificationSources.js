/**
 * Notification sources — add a new entry here to add a new notification type.
 *
 * Each source defines:
 *  id              — unique key (used for per-source seenIds tracking)
 *  label           — shown in the notification panel item header
 *  detectDeparture — if true, notifies when leads LEAVE this status (e.g., pre-price provided)
 *                    if false/absent, notifies when leads ARRIVE (default behaviour)
 *  params          — query params passed to the API fetch function
 *  fetch           — async (params) => axios response
 *  getItems        — (axiosResponse) => Item[]
 *  toTitle         — (Item[]) => string  notification heading
 *  toBody          — (Item[]) => string  notification sub-line
 *  navPath         — route to open when the notification is clicked
 */

import { getBuyFollowupLeads } from "../api/services";

const customerOf = (it) => it.customerName || `Lead #${it.id}`;
const vehicleOf  = (it) => [it.make, it.model, it.year].filter(Boolean).join(" ");
const listNames  = (items) =>
    items.slice(0, 3).map(customerOf).join(", ") +
    (items.length > 3 ? ` +${items.length - 3} more` : "");

export const NOTIFICATION_SOURCES = [
    /* ── Arrival sources ── notify when leads enter this stage ── */
    {
        id:       "fresh_allocation",
        label:    "New Lead",
        params:   { buy_stage: "Fresh", limit: 20, sort_by: "id", sort_order: "desc" },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
        toTitle:  (items)  => items.length === 1
            ? `New lead assigned — ${customerOf(items[0])}`
            : `${items.length} new leads assigned to you`,
        toBody:   (items)  => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        navPath:  "/leads/buyleadfollowuplist",
    },
    {
        id:       "reallocation",
        label:    "Reallocated",
        params:   { buy_stage: "UnderFollowup", limit: 20, sort_by: "id", sort_order: "desc" },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
        toTitle:  (items)  => items.length === 1
            ? `Lead reallocated to you — ${customerOf(items[0])}`
            : `${items.length} leads reallocated to you`,
        toBody:   (items)  => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        navPath:  "/leads/buyleadfollowuplist",
    },
    {
        /*
         * Reopen detection — large limit, no explicit sort so the backend
         * can surface recently-updated leads. The poll's prune logic removes
         * IDs that left Fresh (went to Lost/DND) so they re-trigger on return.
         */
        id:       "reopen",
        label:    "Reopened",
        params:   { buy_stage: "Fresh", limit: 100 },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
        toTitle:  (items)  => items.length === 1
            ? `Lead reopened & assigned to you — ${customerOf(items[0])}`
            : `${items.length} leads reopened and assigned to you`,
        toBody:   (items)  => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        navPath:  "/leads/buyleadfollowuplist",
    },

    /* ── Departure source ── notify when leads LEAVE this status ── */
    {
        /*
         * Pre-price provided — fires when a lead that was in "preprice" status
         * disappears from the list (meaning an authorised user gave the price).
         * We query by status=preprice; getItems also filters locally so the
         * correct leads are tracked regardless of whether the backend honours
         * the status query param.
         */
        id:              "preprice_provided",
        label:           "Pre-Price Ready",
        detectDeparture: true,
        params:          { status: "preprice", limit: 100 },
        fetch:           (params) => getBuyFollowupLeads(params),
        getItems:        (res)    =>
            (res.data?.items || []).filter(it => it.status?.toLowerCase() === "preprice"),
        toTitle:  (items)  => items.length === 1
            ? `Pre-price ready — ${customerOf(items[0])}`
            : `${items.length} leads have pre-price ready`,
        toBody:   (items)  => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        navPath:  "/leads/buyleadfollowuplist",
    },

    /* ── Add future sources below ──────────────────────────────
    {
        id:       "appointment",
        label:    "Appointment",
        params:   { buy_stage: "Appointment", limit: 20, sort_by: "id", sort_order: "desc" },
        fetch:    (params) => getBuyFollowupLeads(params),
        getItems: (res)    => res.data?.items || [],
        toTitle:  (items)  => items.length === 1
            ? `Appointment set — ${customerOf(items[0])}`
            : `${items.length} appointments`,
        toBody:   (items)  => items.length === 1 ? vehicleOf(items[0]) : listNames(items),
        navPath:  "/leads/buyleadfollowuplist",
    },
    ──────────────────────────────────────────────────────────── */
];
