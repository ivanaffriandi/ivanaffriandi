"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TrackerCore() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackVisit = async () => {
      try {
        // Capture original landing referrer and store it in sessionStorage
        let landingReferrer = sessionStorage.getItem("ivan_landing_referrer");
        if (landingReferrer === null) {
          landingReferrer = document.referrer || "";
          sessionStorage.setItem("ivan_landing_referrer", landingReferrer);
        }

        // Parse UTM query parameter
        const utmSource = searchParams.get("utm_source") || searchParams.get("ref") || "";

        // Fire-and-forget tracking
        fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            page: window.location.pathname + window.location.search,
            referrer: landingReferrer,
            utmSource: utmSource
          })
        }).catch(() => {});
      } catch (err) {
        // Silently catch any issues to ensure zero impact on user experience
      }
    };

    trackVisit();
  }, [pathname, searchParams]);

  return null;
}

export default function VisitorTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerCore />
    </Suspense>
  );
}
