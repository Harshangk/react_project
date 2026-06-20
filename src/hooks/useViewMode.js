import { useState } from "react";

const KEY = "crm_view_mode";

export function useViewMode() {
    const [view, setViewState] = useState(
        () => sessionStorage.getItem(KEY) || "table"
    );

    const setView = (v) => {
        sessionStorage.setItem(KEY, v);
        setViewState(v);
    };

    return [view, setView];
}
