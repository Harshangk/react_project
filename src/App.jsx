import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appConfig from "./config/appConfig";
import { applyTheme, getPreferredTheme } from "./utils/theme";

function App() {
  const [theme, setTheme] = useState(() => applyTheme(getPreferredTheme()));

  useEffect(() => {
    document.title = appConfig.appName;

    const handleThemeChange = (event) => {
      setTheme(applyTheme(event.detail?.theme || getPreferredTheme()));
    };

    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        setTheme(applyTheme(event.newValue || getPreferredTheme()));
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("themechange", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme={theme}
      />
    </>
  );
}

export default App;
