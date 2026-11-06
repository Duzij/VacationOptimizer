import { useEffect, useRef, useState } from "react";

const desktopMediaQuery = "(min-width: 1280px)";

interface AdvertisingConsent {
  advertising?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
    VacationOptimizerCookieConsent?: {
      getConsent: () => AdvertisingConsent | null;
    };
  }
}

export default function AdSenseUnit({ slot, desktopOnly = false }: { slot: string; desktopOnly?: boolean }) {
  const [isViewportEligible, setIsViewportEligible] = useState(() =>
    !desktopOnly || (typeof window !== "undefined" && window.matchMedia(desktopMediaQuery).matches),
  );
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!desktopOnly) {
      setIsViewportEligible(true);
      return;
    }

    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const updateViewport = (event: MediaQueryListEvent) => setIsViewportEligible(event.matches);
    setIsViewportEligible(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, [desktopOnly]);

  useEffect(() => {
    if (!isViewportEligible) return;

    const ad = adRef.current;
    if (!ad) return;

    const requestAd = () => {
      const consent = window.VacationOptimizerCookieConsent?.getConsent();
      if (consent?.advertising !== true || ad.dataset.adsenseInitialized === "true") return;

      ad.dataset.adsenseInitialized = "true";
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    };

    window.addEventListener("vacationOptimizer:cookie-consent-change", requestAd);
    requestAd();

    return () => {
      window.removeEventListener("vacationOptimizer:cookie-consent-change", requestAd);
    };
  }, [isViewportEligible]);

  if (!isViewportEligible) return null;

  return (
    <div className="min-w-0 w-full max-w-full text-center">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", maxWidth: "100%" }}
        data-ad-client="ca-pub-9485445500768000"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  );
}
