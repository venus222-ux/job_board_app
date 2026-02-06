import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { HelmetProvider } from "react-helmet-async"; // ✅ import HelmetProvider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      {" "}
      {/* ✅ wrap App with HelmetProvider */}
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
