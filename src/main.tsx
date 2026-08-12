import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Ensure $_TSR global expected by TanStack Start exists before any internal calls
if (typeof window !== "undefined") {
  (window as any).$_TSR = (window as any).$_TSR || {
    t: new Map(),
    buffer: [],
    initialized: false,
    router: { manifest: {} },
  };
  (window as any).__TSR_DEHYDRATED__ = (window as any).__TSR_DEHYDRATED__ || { data: {} };
  (window as any).__TSR_ROUTER__ = (window as any).__TSR_ROUTER__ || {};
}

const router = getRouter();

if (!(router as any).ssr) {
  (router as any).ssr = {};
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
