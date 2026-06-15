/// <reference types="vite-plugin-pwa/client" />

import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Service-worker auto-update hook.
 * - Polls for new versions every 30 minutes while the app is open.
 * - When a new SW is detected, calls updateServiceWorker(true) which activates
 *   the new SW and reloads the page in place.
 *
 * Combined with vite-plugin-pwa's registerType: 'autoUpdate' this gives users
 * automatic in-place updates without manual reloads.
 */
export function ServiceWorkerUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Check for updates every 30 min while the tab is open
      setInterval(
        () => {
          registration.update().catch(() => {});
        },
        30 * 60 * 1000
      );
    },
  });

  useEffect(() => {
    if (needRefresh) {
      // New SW is waiting — activate it and reload immediately
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
