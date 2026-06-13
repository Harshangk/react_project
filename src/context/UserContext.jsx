import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/services";

const UserContext = createContext(null);

/**
 * Unwrap common API envelope shapes:
 *   { userName, roleId }           → direct
 *   { data: { userName, roleId } } → wrapped (common in REST APIs)
 * Then normalise field names so consumers always use `userName` / `roleName`.
 */
const unwrapAndNormalize = (raw = {}) => {
    /* Unwrap envelope if present */
    const d = (raw && typeof raw === "object" && raw.data && typeof raw.data === "object")
        ? raw.data
        : raw;

    return {
        ...d,
        userName: d.userName || d.name || d.username || d.fullName || d.user_name || d.email || "",
        roleName: d.roleName || d.role_name || d.role?.name
            || (typeof d.role === "string" ? d.role : "")
            || "",
    };
};

export function UserProvider({ children }) {
    const [user, setUser]           = useState(null);
    const [userLoading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { setLoading(false); return; }

        getCurrentUser()
            .then(res => setUser(unwrapAndNormalize(res.data)))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <UserContext.Provider value={{ user, userLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
