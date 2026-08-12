import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Safeguard TanStack Start hydration globals using Proxy shield for static SPA mode
if (typeof window !== "undefined") {
  if (!window.$_TSR) {
    const baseRouter = {
      manifest: {},
      matches: [],
      dehydratedData: {},
      state: { matches: [] },
    };
    const routerProxy = new Proxy(baseRouter, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if (prop === "matches" || prop === "buffer" || prop === "scripts") return [];
        return {};
      },
    });

    const baseTSR = {
      t: new Map(),
      buffer: [],
      initialized: false,
      router: routerProxy,
      h: () => {},
      clean: () => {},
      init: () => {},
    };

    window.$_TSR = new Proxy(baseTSR, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        if (prop === "matches" || prop === "buffer" || prop === "scripts") return [];
        return () => {};
      },
    });
  }
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
