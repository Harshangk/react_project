import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * Gate that redirects unauthenticated users to /login.
 * Reads from UserContext — no duplicate getCurrentUser() network call.
 */
function ProtectedRoute({ children }) {
    const { user, userLoading } = useUser();

    if (userLoading) return null; /* UserContext is fetching — render nothing (App shows no flash) */
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default ProtectedRoute;
