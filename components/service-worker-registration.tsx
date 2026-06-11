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
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure must never break the app
    });
  }, []);

  return null;
};
