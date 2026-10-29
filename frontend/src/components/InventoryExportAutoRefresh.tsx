"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function InventoryExportAutoRefresh() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  useEffect(() => {
    if (isRefreshing) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        startTransition(() => {
          router.refresh();
        });
      }
    }, 3_000);

    return () => window.clearTimeout(timer);
  }, [isRefreshing, router]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        startTransition(() => {
          router.refresh();
        });
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return (
    <p className="mt-3 text-sm text-muted" role="status">
      Export statuses update automatically while requests are being prepared.
    </p>
  );
}
