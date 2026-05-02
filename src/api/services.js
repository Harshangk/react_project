import API from "./api";

export const getMenu = () => {
    return API.get("/v1/poc/menu");
};

export const getCurrentUser = () => {
    return API.get("/v1/poc/user/me");
};

export const getLeadSources = () => {
    return API.get("/v1/poc/common/lead-source");
};

export const getMake = () => {
    return API.get("/v1/poc/common/make");
};

export const getModel = (makeId) => {
    return API.get("/v1/poc/common/model", {
        params: { make_id: makeId },
    });
};

export const getUser = (roleId) => {
    return API.get("/v1/poc/user", {
        params: { role_id: roleId },
    });
};

export const getBroker = () => {
    return API.get("/v1/poc/common/broker");
};

export const getBranch = () => {
    return API.get("/v1/poc/common/branch");
};

export const getState = () => {
    return API.get("/v1/poc/common/state");
};

export const getCity = (stateId) => {
    return API.get("/v1/poc/common/city", {
        params: { state_id: stateId },
    });
};

export const postBuyLead = (data) => {
    return API.post("/v1/poc/buy", data);
};

export const putBuyLead = (leadId, data) => {
    return API.put(`/v1/poc/buy/${leadId}`, data);
};

export const getBuyLeads = (params = {}) => {
    return API.get("/v1/poc/buy", {
        params: params,
    });
};

export const getBuyLeadExport = (params = {}) => {
    return API.get("/v1/poc/buy/export", {
        params: params,
        responseType: "blob",
    });
};

export const getBuyLeadByID = (leadId) => {
    return API.get(`/v1/poc/buy/lead/${leadId}`);
};

export const deleteBuyLead = (leadId) => {
    return API.delete(`/v1/poc/buy/${leadId}`);
};

export const patchBuyLeadAllocation = (data) => {
    return API.patch("/v1/poc/buy/allocation", data);
};

export const patchBuyLeadReallocation = (data) => {
    return API.patch("/v1/poc/buy/re-allocation", data);
};

export const patchBuyLeadReopen = (data) => {
    return API.patch("/v1/poc/buy/reopen", data);
};

export const postBuyLeadFollowup = (leadId, data) => {
    return API.post(`/v1/poc/buy/${leadId}/followup`, data);
};

export const getBuyFollowupLeads = (params = {}) => {
    return API.get("/v1/poc/buy/followup", {
        params: params,
    });
};

export const getBuyFollowupLeadExport = (params = {}) => {
    return API.get("/v1/poc/buy/followup/export", {
        params: params,
        responseType: "blob",
    });
};

export const getBuyFollowupLeadByID = (leadId) => {
    return API.get(`/v1/poc/buy/followup/lead/${leadId}`);
};

export const importBuyLead = (formData, onUploadProgress) => {
    return API.post("/v1/poc/buy/import", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );

            if (onUploadProgress) {
                onUploadProgress(percent);
            }
        },
    });
};

export const getBuyImportLeads = (params = {}) => {
    return API.get("/v1/poc/buy/import", {
        params: params,
    });
};

export const downloadImportFile = (fileKey, bucket) => {
    return API.get(
        `/v1/poc/common/import/${encodeURIComponent(fileKey)}/download`,
        {
            params: { bucket },
            responseType: "blob",
        }
    );
};

export const getBuyImportLeadExport = (params = {}) => {
    return API.get("/v1/poc/buy/import/export", {
        params: params,
        responseType: "blob",
    });
};

//#region Enum
export const getAllEnums = () => {
    return API.get("/v1/poc/common/all");
};

export const getBuyModes = () => {
    return API.get("/v1/poc/common/buy-mode");
};

export const getFuelTypes = () => {
    return API.get("/v1/poc/common/fuel-type");
};

export const getColor = () => {
    return API.get("/v1/poc/common/color");
};

export const getOwner = () => {
    return API.get("/v1/poc/common/owner");
};

export const getYear = () => {
    return API.get("/v1/poc/common/year");
};

export const getBuyStage = () => {
    return API.get("/v1/poc/common/buy-stage");
};

export const getBuyStageDispositions = (stage) => {
    return API.get(`/v1/poc/common/buy-stage/${stage}/disposition`);
};

export const getPreferredTime = () => {
    return API.get("/v1/poc/common/preferred-time");
};


//#endregion