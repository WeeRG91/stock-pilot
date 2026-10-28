"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function InventoryRealtime() {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let source: EventSource | undefined;
    const controller = new AbortController();

    async function connect() {
      if (stopped) return;

      clearTimeout(connectionTimer);
      source?.close();

      try {
        const response = await fetch("/api/realtime/authorize", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        if (stopped) return;

        if (response.status === 401 || response.status === 403) {
          router.refresh();
          return;
        }

        if (!response.ok) {
          throw new Error("Subscription authorization failed.");
        }

        const { data } = await response.json();

        if (stopped) return;

        const expiresIn = Date.parse(data.expiresAt) - Date.now();

        if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
          throw new Error("Subscription authorization expired.");
        }

        const url = new URL(data.hubUrl);
        url.searchParams.set("match", data.topic);

        source = new EventSource(url.toString(), {
          withCredentials: true,
        });

        source.onopen = scheduleRefresh;

        source.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);

            if (
              payload?.type === "inventory.changed" &&
              Number.isSafeInteger(payload.productId) &&
              payload.productId > 0 &&
              Number.isSafeInteger(payload.movementId) &&
              payload.movementId > 0
            ) {
              scheduleRefresh();
            }
          } catch {
            // Ignore malformed notifications.
          }
        };

        source.onerror = () => {
          scheduleConnection(5_000);
        };

        connectionTimer = setTimeout(
          () => {
            void connect();
          },
          Math.max(1_000, expiresIn - 15_000),
        );
      } catch {
        scheduleConnection(5_000);
      }
    }

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let connectionTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleRefresh() {
      if (refreshTimer !== undefined) return;

      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;

        if (!stopped) {
          router.refresh();
        }
      }, 250);
    }

    function scheduleConnection(delay: number) {
      clearTimeout(connectionTimer);

      if (stopped) return;

      source?.close();
      connectionTimer = setTimeout(() => {
        void connect();
      }, delay);
    }

    void connect();

    return () => {
      stopped = true;
      controller.abort();
      source?.close();
      clearTimeout(refreshTimer);
      clearTimeout(connectionTimer);
    };
  }, [router]);

  return null;
}
