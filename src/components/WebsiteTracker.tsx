"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function anonymousId(storage: Storage, key: string): string {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

export function WebsiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    try {
      const referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
      const deviceType = /Tablet|iPad/i.test(navigator.userAgent) ? "tablet"
        : /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
      void fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive: true,
        body: JSON.stringify({
          path: pathname,
          visitorId: anonymousId(localStorage, "ltf_visitor_id"),
          sessionId: anonymousId(sessionStorage, "ltf_session_id"),
          referrerHost,
          deviceType,
        }),
      }).catch(() => undefined);
    } catch {
      // Tracking failures must not interrupt studying.
    }
  }, [pathname]);

  return null;
}
