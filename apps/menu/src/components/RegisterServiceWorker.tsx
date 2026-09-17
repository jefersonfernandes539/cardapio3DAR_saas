"use client";

import { useEffect } from "react";

/** Registers the PWA service worker once, on the client, after mount. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Falha ao registrar service worker", err);
      });
    }
  }, []);

  return null;
}
