import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
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
