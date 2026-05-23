import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./styles/global.css";
import 'react-toastify/dist/ReactToastify.css';
import appConfig from "./config/appConfig";
import { applyTheme, getPreferredTheme } from "./utils/theme";

const root = ReactDOM.createRoot(document.getElementById('root'));
document.title = appConfig.appName;
applyTheme(getPreferredTheme());

const favicon = document.getElementById("favicon");
if (favicon) {
  favicon.href = appConfig.favicon;
}
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
