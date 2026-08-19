import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import App from "./App";
import { swrFetcher } from "./lib/apiClient";
import "./tailwind.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{
      fetcher: swrFetcher,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }}>
      <App />
    </SWRConfig>
  </StrictMode>,
);
