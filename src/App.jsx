import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appConfig from "./config/appConfig";
import { applyTheme, getPreferredTheme } from "./utils/theme";
import { UserProvider } from "./context/UserContext";

function App() {
    const [theme, setTheme] = useState(() => applyTheme(getPreferredTheme()));

    useEffect(() => {
        document.title = appConfig.appName;

        const onThemeChange  = (e) => setTheme(applyTheme(e.detail?.theme || getPreferredTheme()));
        const onStorageChange = (e) => { if (e.key === "theme") setTheme(applyTheme(e.newValue || getPreferredTheme())); };

        window.addEventListener("themechange", onThemeChange);
        window.addEventListener("storage",     onStorageChange);
        return () => {
            window.removeEventListener("themechange", onThemeChange);
            window.removeEventListener("storage",     onStorageChange);
        };
    }, []);

    return (
        <UserProvider>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={2500} theme={theme} />
        </UserProvider>
    );
}

export default App;
