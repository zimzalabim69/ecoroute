"use client";

import { useEffect } from "react";

const SW_VERSION = "ecoroute-v2"; // Bump this to force unregister old SWs

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        // Unregister ALL existing service workers (forces clean slate)
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
          console.log("[SW] Unregistered old service worker");
        }

        // Wipe all caches
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
          console.log("[SW] Deleted cache:", name);
        }

        // Now register the fresh service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        console.log("[SW] Registered:", registration.scope, "version:", SW_VERSION);

        // Force the new SW to activate immediately
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version waiting — skip waiting to activate immediately
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    };

    register();
  }, []);

  return null;
}
