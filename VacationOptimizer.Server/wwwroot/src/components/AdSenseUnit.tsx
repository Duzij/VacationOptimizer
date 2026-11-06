import { useEffect, useRef } from "react";

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

export default function AdSenseUnit({ slot }: { slot: string }) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-2 text-center">
      <span className="block text-xs text-text-muted">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9485445500768000"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
