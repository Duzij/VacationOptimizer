import { useCallback, useEffect, type ReactNode } from "react";
import { PostHogProvider, usePostHog } from "@posthog/react";

const consentStorageKey = "vacationOptimizer.cookieConsent.v1";
const consentChangeEvent = "vacationOptimizer:cookie-consent-change";
const debug = true;

function log(...args: unknown[]) {
  if (debug) {
    console.log("[posthog]", ...args);
  }
}

function hasSavedAnalyticsConsent() {
  try {
    const storedConsent = window.localStorage.getItem(consentStorageKey);
    if (!storedConsent) {
      return false;
    }

    const consent = JSON.parse(storedConsent) as { analytics?: unknown };
    return consent.analytics === true;
  } catch {
    return false;
  }
}

function setAnalyticsConsent(posthog: ReturnType<typeof usePostHog>, hasConsent: boolean) {
  if (!hasConsent) {
    log("no consent -> opt_out_capturing");
    posthog.opt_out_capturing();
    return;
  }

  log("consent granted -> opt_in_capturing + $pageview");
  posthog.opt_in_capturing({ captureEventName: false });
  posthog.capture("$pageview");
}

function PostHogConsentGate({ children }: { children: ReactNode }) {
  const posthog = usePostHog();

  useEffect(() => {
    const saved = hasSavedAnalyticsConsent();
    log("consent gate mount, saved consent =", saved);
    setAnalyticsConsent(posthog, saved);
  }, [posthog]);

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      const consent = (event as CustomEvent<{ analytics?: unknown }>).detail;
      log("consent change event received", consent);
      setAnalyticsConsent(posthog, consent?.analytics === true);
    };

    window.addEventListener(consentChangeEvent, handleConsentChange);
    return () => window.removeEventListener(consentChangeEvent, handleConsentChange);
  }, [posthog]);

  return <>{children}</>;
}

export function PostHogAnalytics({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST;

  if (!apiKey || !apiHost) {
    console.warn("PostHog API key or host is not set. Analytics will be disabled.");
    return <>{children}</>;
  }

  log("initializing", { apiHost });

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        defaults: "2026-05-30"
      }}
    >
      <PostHogConsentGate>{children}</PostHogConsentGate>
    </PostHogProvider>
  );
}

export function useAnalytics() {
  const posthog = usePostHog();

  const capture = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      log("capture", eventName, properties ?? {}, "optedOut=", posthog.has_opted_out_capturing());
      posthog.capture(eventName, properties);
    },
    [posthog],
  );

  return { posthog, capture };
}
