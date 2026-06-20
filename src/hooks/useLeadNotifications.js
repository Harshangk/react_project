import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { NOTIFICATION_SOURCES } from "../config/notificationSources";

const POLL_MS  = 30_000;
const MAX_KEEP = 30;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function isAssignedToMe(lead, username) {
    if (!username) return true;
    const u = username.toLowerCase().trim();
    return (
        (lead.telecaller && lead.telecaller.toLowerCase().trim() === u) ||
        (lead.executive  && lead.executive.toLowerCase().trim()  === u)
    );
}

function showBrowserNotif(title, body, onClick) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
        const n = new Notification(title, {
            body,
            icon:     "/favicon.ico",
            badge:    "/favicon.ico",
            tag:      "lead-notif",
            renotify: true,
        });
        n.onclick = () => { window.focus(); onClick?.(); n.close(); };
    } catch { /* private-mode / unsupported — silently skip */ }
}

function showToast(title, body, onClick, type = "info") {
    toast(
        body ? `${title}\n${body}` : title,
        {
            className: `app-toast app-toast--${type}`,
            autoClose: 8000,
            onClick,
            style:     onClick ? { cursor: "pointer" } : undefined,
            icon:      false,
        }
    );
}

function buildNotif(src, lead) {
    return {
        id:          `${src.id}-${lead.id}-${Date.now()}`,
        sourceId:    src.id,
        sourceLabel: src.label,
        leadId:      lead.id,
        customer:    lead.customerName || `Lead #${lead.id}`,
        vehicle:     [lead.make, lead.model, lead.year].filter(Boolean).join(" "),
        mobile:      lead.mobile || "",
        timestamp:   new Date(),
        navPath:     src.navPath,
        read:        false,
    };
}

/* ── Hook ────────────────────────────────────────────────────────────── */

export function useLeadNotifications(userId, currentUsername) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [notifPermission, setNotifPermission] = useState(
        "Notification" in window ? Notification.permission : "unsupported"
    );

    /*
     * seenMap  — Map<sourceId, Set<leadId>>
     *            Tracks which IDs have been seen for each source.
     *            On every poll, IDs that left the results are pruned
     *            so they can re-trigger if they return (e.g., reopen).
     *
     * detailMap — Map<sourceId, Map<leadId, leadObject>>
     *             Only populated for sources with detectDeparture: true.
     *             Stores full lead objects so we can build a notification
     *             message when a lead *leaves* a status (e.g., pre-price provided).
     */
    const seenMap   = useRef(null);
    const detailMap = useRef(null);
    const timerRef  = useRef(null);

    const usernameRef = useRef(currentUsername);
    useEffect(() => { usernameRef.current = currentUsername; }, [currentUsername]);

    /* ── Notification dispatcher ─────────────────────────────────── */
    const dispatch = useCallback((src, leads) => {
        if (leads.length === 0) return;

        const title   = src.toTitle(leads);
        const body    = src.toBody(leads);
        const navPath = src.navPath;

        const newNotifs = leads.map(it => buildNotif(src, it));
        setNotifications(prev => [...newNotifs, ...prev].slice(0, MAX_KEEP));
        setUnreadCount(prev => prev + newNotifs.length);
        showToast(title, body, () => { window.location.href = navPath; }, "notification");
        showBrowserNotif(title, body, () => { window.location.href = navPath; });
    }, []);

    /* ── Core poll ──────────────────────────────────────────────── */
    const poll = useCallback(async () => {
        const results = await Promise.allSettled(
            NOTIFICATION_SOURCES.map(src => src.fetch(src.params))
        );

        const uname = usernameRef.current;

        results.forEach((result, idx) => {
            if (result.status !== "fulfilled") return;

            const src   = NOTIFICATION_SOURCES[idx];
            const items = src.getItems(result.value);

            /* ── First-ever poll: seed; never notify ── */
            if (!seenMap.current.has(src.id)) {
                seenMap.current.set(src.id, new Set(items.map(it => it.id)));

                if (src.detectDeparture) {
                    const dmap = new Map();
                    items.forEach(it => dmap.set(it.id, it));
                    detailMap.current.set(src.id, dmap);
                }
                return;
            }

            const seen       = seenMap.current.get(src.id);
            const currentIds = new Set(items.map(it => it.id));

            /* ── Departure source (e.g., pre-price provided) ─────────
             * Notify when leads LEAVE this status rather than arrive.
             * We keep full details in detailMap so we can reference
             * customer/vehicle in the notification message.
             * ─────────────────────────────────────────────────────── */
            if (src.detectDeparture) {
                const dmap = detailMap.current.get(src.id) ?? new Map();
                const departedLeads = [];

                for (const id of seen) {
                    if (!currentIds.has(id)) {
                        if (dmap.has(id)) departedLeads.push(dmap.get(id));
                        seen.delete(id);
                        dmap.delete(id);
                    }
                }

                /* Track new arrivals (just entered this status) */
                items.forEach(it => {
                    if (!seen.has(it.id)) {
                        seen.add(it.id);
                        dmap.set(it.id, it);
                    }
                });

                const myDeparted = departedLeads.filter(it => isAssignedToMe(it, uname));
                dispatch(src, myDeparted);
                return;
            }

            /* ── Arrival source (normal: fresh allocation, reallocation, reopen)
             * Prune IDs that left the stage — allows re-notification if a lead
             * returns (e.g., reopened from Lost/DND).
             * ─────────────────────────────────────────────────────── */
            for (const id of seen) {
                if (!currentIds.has(id)) seen.delete(id);
            }

            const newItems = items.filter(it => !seen.has(it.id));
            newItems.forEach(it => seen.add(it.id));

            const myLeads = newItems.filter(it => isAssignedToMe(it, uname));
            dispatch(src, myLeads);
        });
    }, []); /* empty deps — reads everything through refs */

    /* ── Start polling once userId is known ─────────────────────── */
    useEffect(() => {
        if (!userId) return;

        seenMap.current   = new Map();
        detailMap.current = new Map();
        poll();
        timerRef.current = setInterval(poll, POLL_MS);

        return () => { clearInterval(timerRef.current); timerRef.current = null; };
    }, [userId, poll]);

    /* ── Permission request (must be a user gesture) ────────────── */
    const requestPermission = useCallback(async () => {
        if (!("Notification" in window)) {
            showToast("Your browser does not support notifications.", "", null, "info");
            return;
        }
        if (Notification.permission === "denied") {
            showToast(
                "Notifications are blocked.",
                "Open Chrome → address bar 🔒 → Site settings → Notifications → Allow.",
                null, "error"
            );
            return;
        }
        if (Notification.permission === "granted") {
            showToast("Browser notifications are already enabled.", "", null, "success");
            return;
        }

        const result = await Notification.requestPermission();
        setNotifPermission(result);

        if (result === "granted") {
            showToast(
                "Browser notifications enabled.",
                "You will be alerted when a lead is assigned to you.",
                null, "success"
            );
            showBrowserNotif("Notifications active", "Lead assignment alerts are now on.", null);
        } else {
            showToast(
                "Notifications were not allowed.",
                "Click the 🔒 icon in the address bar to enable them later.",
                null, "error"
            );
        }
    }, []);

    /* ── Exported actions ────────────────────────────────────────── */
    const markAllRead = useCallback(() => {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const removeNotif = useCallback((id) => {
        setNotifications(prev => {
            const gone = prev.find(n => n.id === id && !n.read);
            if (gone) setUnreadCount(c => Math.max(0, c - 1));
            return prev.filter(n => n.id !== id);
        });
    }, []);

    return { notifications, unreadCount, notifPermission, requestPermission, markAllRead, removeNotif };
}
