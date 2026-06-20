import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { NOTIFICATION_SOURCES } from "../config/notificationSources";
import { useNotificationSocket } from "./useNotificationSocket";

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
            body, icon: "/favicon.ico", badge: "/favicon.ico",
            tag: "lead-notif", renotify: true,
        });
        n.onclick = () => { window.focus(); onClick?.(); n.close(); };
    } catch { /* private-mode / unsupported */ }
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

/**
 * Real-time notifications with automatic fallback.
 *
 * PRIMARY  — WebSocket: zero API calls, instant delivery.
 *            Server pushes: { sourceId, lead: { id, customerName, mobile,
 *                             telecaller, executive, make, model, year } }
 *
 * FALLBACK — REST polling every 30 s, activated automatically when:
 *            • WebSocket endpoint not yet implemented (3× 403 handshake failures)
 *            • WebSocket drops and is reconnecting
 *
 * wsStatus: "connecting" | "live" | "reconnecting" | "polling"
 *   "polling" means WS permanently failed; polling is the active transport.
 */
export function useLeadNotifications(userId, currentUsername) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [wsStatus, setWsStatus]           = useState("connecting");
    const [notifPermission, setNotifPermission] = useState(
        "Notification" in window ? Notification.permission : "unsupported"
    );

    const usernameRef  = useRef(currentUsername);
    const wsStatusRef  = useRef("connecting");      // readable inside poll interval
    const seenMap      = useRef(null);
    const detailMap    = useRef(null);
    const timerRef     = useRef(null);

    useEffect(() => { usernameRef.current = currentUsername; }, [currentUsername]);

    const setStatus = useCallback((s) => {
        wsStatusRef.current = s;
        setWsStatus(s);
    }, []);

    /* ── Shared dispatcher (used by both WS and polling paths) ───── */
    const dispatchOne = useCallback((src, lead) => {
        if (!isAssignedToMe(lead, usernameRef.current)) return;
        const notif   = buildNotif(src, lead);
        const onClick = () => { window.location.href = src.navPath; };
        setNotifications(prev => [notif, ...prev].slice(0, MAX_KEEP));
        setUnreadCount(prev => prev + 1);
        showToast(src.toTitle([lead]), src.toBody([lead]), onClick, "notification");
        showBrowserNotif(src.toTitle([lead]), src.toBody([lead]), onClick);
    }, []);

    /* ── WS message handler ──────────────────────────────────────── */
    const handleWsMessage = useCallback((msg) => {
        const src = NOTIFICATION_SOURCES.find(s => s.id === msg.sourceId);
        if (!src || !msg.lead) return;
        dispatchOne(src, msg.lead);
    }, [dispatchOne]);

    /* ── Polling (fallback) ──────────────────────────────────────── */
    const poll = useCallback(async () => {
        const results = await Promise.allSettled(
            NOTIFICATION_SOURCES.map(src => src.fetch(src.params))
        );

        const uname = usernameRef.current;

        results.forEach((result, idx) => {
            if (result.status !== "fulfilled") return;
            const src   = NOTIFICATION_SOURCES[idx];
            const items = src.getItems(result.value);

            /* First poll — seed; never notify */
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

            if (src.detectDeparture) {
                const dmap    = detailMap.current.get(src.id) ?? new Map();
                const departed = [];
                for (const id of seen) {
                    if (!currentIds.has(id)) {
                        if (dmap.has(id)) departed.push(dmap.get(id));
                        seen.delete(id);
                        dmap.delete(id);
                    }
                }
                items.forEach(it => { if (!seen.has(it.id)) { seen.add(it.id); dmap.set(it.id, it); } });
                departed.filter(it => isAssignedToMe(it, uname)).forEach(it => dispatchOne(src, it));
                return;
            }

            for (const id of seen) { if (!currentIds.has(id)) seen.delete(id); }
            const fresh = items.filter(it => !seen.has(it.id));
            fresh.forEach(it => seen.add(it.id));
            fresh.filter(it => isAssignedToMe(it, uname)).forEach(it => dispatchOne(src, it));
        });
    }, [dispatchOne]);

    const startPolling = useCallback(() => {
        if (!userId || timerRef.current) return;
        seenMap.current   = new Map();
        detailMap.current = new Map();
        poll();                                             // immediate seed
        timerRef.current  = setInterval(poll, POLL_MS);
    }, [userId, poll]);

    const stopPolling = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    /* ── WebSocket connection ────────────────────────────────────── */
    useNotificationSocket({
        userId,
        onMessage: handleWsMessage,
        onOpen: () => {
            setStatus("live");
            stopPolling();          // WS is up — no need to poll
        },
        onClose: () => {
            setStatus("reconnecting");
            startPolling();         // WS dropped — poll until it comes back
        },
        onFailed: () => {
            setStatus("polling");   // WS permanently unavailable — poll forever
            startPolling();
        },
    });

    /* ── Initial poll: run immediately so seenMap is seeded even
       before WS connects (prevents false-positives on WS first event) */
    useEffect(() => {
        if (!userId) return;
        seenMap.current   = new Map();
        detailMap.current = new Map();
        poll();
        return () => { stopPolling(); };
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Permission request ─────────────────────────────────────── */
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
            showToast("Browser notifications enabled.", "You will be alerted when a lead is assigned to you.", null, "success");
            showBrowserNotif("Notifications active", "Lead assignment alerts are now on.", null);
        } else {
            showToast("Notifications were not allowed.", "Click the 🔒 icon in the address bar to enable them later.", null, "error");
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

    return { notifications, unreadCount, wsStatus, notifPermission, requestPermission, markAllRead, removeNotif };
}
