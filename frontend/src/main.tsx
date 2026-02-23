import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LogsProvider } from "./storage";
import { AuthProvider } from "./auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <LogsProvider>
          <App />
        </LogsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
