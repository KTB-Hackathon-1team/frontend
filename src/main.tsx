import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "../app/globals.css";

const initialPath = window.location.pathname.replace(/\/+$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider restoreSession={initialPath === "/"}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
