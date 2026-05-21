"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✔ Service Worker registered successfully:", registration.scope);
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
          });
      };

      // Register service worker on window load to not block initial page rendering
      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Listen for custom installation prompt and store it globally for other components to access
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar on mobile
      e.preventDefault();
      
      // Store the event globally so our Sidebar or Settings can trigger it
      (window as any).deferredPrompt = e;
      
      // Dispatch a custom event to notify components that the PWA is installable
      window.dispatchEvent(new CustomEvent("pwa-installable"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect if app is already running in standalone mode (installed)
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        (window as any).isPWAInstalled = true;
        window.dispatchEvent(new CustomEvent("pwa-installed-status", { detail: true }));
      } else {
        (window as any).isPWAInstalled = false;
        window.dispatchEvent(new CustomEvent("pwa-installed-status", { detail: false }));
      }
    };

    handleDisplayModeChange(mediaQuery);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  return null;
}
