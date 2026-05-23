import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api/services";

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await getCurrentUser();
                setAuthenticated(true);
            } catch (error) {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;