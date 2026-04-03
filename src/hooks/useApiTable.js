import { useState, useEffect } from "react";

export default function useApiTable(apiFn, initialParams = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({
        total: 0,
        next: null,
        limit: initialParams.limit || 10,
    });

    const [params, setParams] = useState(initialParams);

    const fetchData = async (extraParams = {}) => {
        try {
            setLoading(true);

            const finalParams = { ...params, ...extraParams };

            const res = await apiFn(finalParams);
            const result = res.data;

            setData(result.items || []);
            setMeta({
                total: result.total,
                next: result.next,
                limit: result.limit,
            });

            setParams(finalParams);

        } catch (err) {
            console.error("API Table Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        meta,
        fetchData,
        params,
    };
}
