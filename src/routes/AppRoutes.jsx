import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/login";
import Dashboard from "../pages/dashboard/dashboard";
import BuyLeadForm from "../pages/buylead/buylead";
import BuyImportLead from "../pages/buylead/buyleadimport";
import ProtectedRoute from "./ProtectedRoute";
import BuyLeadList from "../pages/buylead/buyleadlist";
import BuyLeadImportList from "../pages/buylead/buyleadtracker";
import UntouchedBuyList from "../pages/buylead/untouchedlist";
import ReallocationBuyList from "../pages/buylead/buyleadreallocationlist";
import BuyFollowupLeadList from "../pages/buylead/buyleadfollowuplist";
import BuyFollowupLead from "../pages/buylead/buyleadfollowup";
import LostBuyList from "../pages/buylead/buyleadlostlist";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Route */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/leads/buylead"
                    element={
                        <ProtectedRoute>
                            <BuyLeadForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/leads/buyleadimport"
                    element={
                        <ProtectedRoute>
                            <BuyImportLead />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/leads/buylead/:id"
                    element={
                        <ProtectedRoute>
                            <BuyLeadForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/leads/buyleadlist"
                    element={
                        <ProtectedRoute>
                            <BuyLeadList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/leads/buyleadtracker"
                    element={
                        <ProtectedRoute>
                            <BuyLeadImportList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leads/untouchedlist"
                    element={
                        <ProtectedRoute>
                            <UntouchedBuyList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leads/buyleadlostlist"
                    element={
                        <ProtectedRoute>
                            <LostBuyList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leads/reallocationlist"
                    element={
                        <ProtectedRoute>
                            <ReallocationBuyList />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/leads/buyleadfollowuplist"
                    element={
                        <ProtectedRoute>
                            <BuyFollowupLeadList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leads/buyleadfollowup/:id"
                    element={
                        <ProtectedRoute>
                            <BuyFollowupLead />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route path="*" element={<Login />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
