import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import appConfig from "./config/appConfig";

function App() {
  document.title = appConfig.appName;
  return (
    <>
      <AppRoutes />

      {/* ✅ Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
      />
    </>
  );
}

export default App;

