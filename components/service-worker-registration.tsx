"use client";

import { useEffect } from "react";

export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    // Honor a configured base path so the worker scope is correct on
    // subdirectory deployments (NEXT_PUBLIC_* is inlined at build time)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
      // Registration failure must never break the app
    });
  }, []);

  return null;
};
