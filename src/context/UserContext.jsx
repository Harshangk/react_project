import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/services";
import { logoutUser } from "../api/authService";

const UserContext = createContext(null);

/**
 * Unwrap common API envelope shapes and normalise field names.
 * Consumers always read `user.userName` and `user.roleName`.
 */
const unwrapAndNormalize = (raw = {}) => {
    const d = (raw && typeof raw === "object" && raw.data && typeof raw.data === "object")
        ? raw.data
        : raw;

    return {
        ...d,
        userName: d.userName || d.name || d.username
            || d.fullName || d.user_name
            || d.user?.userName || d.user?.username || d.user?.name
            || d.email || "",
        roleName: d.roleName || d.role_name || d.role?.name
            || (typeof d.role === "string" ? d.role : "")
            || d.user?.roleName || d.user?.role_name || "",
        /* Normalised role ID — checked once here so every consumer just reads user.roleId */
        roleId: d.roleId ?? d.role_id ?? d.role?.id ?? d.role?.role_id
            ?? d.user?.roleId ?? d.user?.role_id ?? null,
    };
};

export function UserProvider({ children }) {
    const [user, setUser]           = useState(null);
    const [userLoading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then(res => setUser(unwrapAndNormalize(res.data)))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    /* Called after login so ProtectedRoute sees the authenticated user before navigation */
    const refreshUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCurrentUser();
            setUser(unwrapAndNormalize(res.data));
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try { await logoutUser(); } catch { /* backend unavailable — still clear client state */ }
        setUser(null);
        window.location.replace("/login");
    }, []);

    return (
        <UserContext.Provider value={{ user, userLoading, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
