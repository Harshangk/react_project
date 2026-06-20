import { useEffect, useRef, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const WS_BASE  = API_BASE.replace(/^http/, "ws");
const WS_PATH  = "/ws/notifications";

const MAX_RETRIES          = 8;     // network-drop retries (after successful handshake)
const MAX_HANDSHAKE_FAILS  = 3;     // stop after N consecutive 403/404/no-endpoint failures
const BACKOFF_BASE         = 1_000; // 1s → 2 → 4 → 8 … 128s
const HEARTBEAT_MS         = 25_000;

/**
 * onFailed — called when the server consistently rejects the WS handshake
 * (e.g., endpoint not yet implemented). The caller should fall back to polling.
 */
export function useNotificationSocket({ userId, onMessage, onOpen, onClose, onFailed }) {
    const wsRef           = useRef(null);
    const retriesRef      = useRef(0);
    const handshakeFails  = useRef(0);
    const retryTimer      = useRef(null);
    const pingTimer       = useRef(null);
    const mountedRef      = useRef(false);

    const cbRef = useRef({});
    useEffect(() => { cbRef.current = { onMessage, onOpen, onClose, onFailed }; });

    const clearTimers = useCallback(() => {
        clearTimeout(retryTimer.current);
        clearInterval(pingTimer.current);
    }, []);

    const connect = useCallback(() => {
        if (!mountedRef.current || !userId) return;

        const url = `${WS_BASE}${WS_PATH}?userId=${encodeURIComponent(userId)}`;
        const ws  = new WebSocket(url);
        let opened = false;
        wsRef.current = ws;

        ws.onopen = () => {
            opened = true;
            retriesRef.current     = 0;
            handshakeFails.current = 0;
            pingTimer.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));
                }
            }, HEARTBEAT_MS);
            cbRef.current.onOpen?.();
        };

        ws.onmessage = ({ data }) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === "pong") return;
                cbRef.current.onMessage?.(msg);
            } catch { /* ignore non-JSON */ }
        };

        ws.onclose = () => {
            clearInterval(pingTimer.current);
            if (!mountedRef.current) return;

            if (!opened) {
                // Handshake rejection — 403, endpoint missing, CORS, etc.
                handshakeFails.current++;
                if (handshakeFails.current >= MAX_HANDSHAKE_FAILS) {
                    cbRef.current.onFailed?.();  // tell caller to use polling
                    return;                       // stop retrying WS
                }
            } else {
                cbRef.current.onClose?.();
            }

            if (retriesRef.current >= MAX_RETRIES) return;
            const delay = BACKOFF_BASE * 2 ** retriesRef.current;
            retriesRef.current++;
            retryTimer.current = setTimeout(connect, delay);
        };

        ws.onerror = () => ws.close();
    }, [userId, clearTimers]);

    useEffect(() => {
        if (!userId) return;
        mountedRef.current = true;
        connect();
        return () => {
            mountedRef.current = false;
            clearTimers();
            wsRef.current?.close();
        };
    }, [userId, connect, clearTimers]);
}
