import { useCallback, useEffect, type ReactNode } from "react";
import { PostHogProvider, usePostHog } from "@posthog/react";
import type { CaptureResult } from "posthog-js";

const consentStorageKey = "vacationOptimizer.cookieConsent.v1";
const consentChangeEvent = "vacationOptimizer:cookie-consent-change";

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

function sanitizeUrl(url: unknown) {
  if (typeof url !== "string") {
    return url;
  }

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return undefined;
  }
}

function minimizeEventData(event: CaptureResult | null) {
  if (!event) {
    return event;
  }

  const currentUrl = sanitizeUrl(event.properties.$current_url);
  if (typeof currentUrl === "string") {
    event.properties.$current_url = currentUrl;
  } else {
    delete event.properties.$current_url;
  }

  delete event.properties.$referrer;
  return event;
}

function setAnalyticsConsent(posthog: ReturnType<typeof usePostHog>, hasConsent: boolean) {
  if (!hasConsent) {
    posthog.opt_out_capturing();
    return;
  }

  posthog.opt_in_capturing({ captureEventName: false });
  posthog.capture("$pageview");
}

function PostHogConsentGate({ children }: { children: ReactNode }) {
  const posthog = usePostHog();

  useEffect(() => {
    setAnalyticsConsent(posthog, hasSavedAnalyticsConsent());
  }, [posthog]);

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      const consent = (event as CustomEvent<{ analytics?: unknown }>).detail;
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

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        defaults: "2026-05-30",
        opt_out_capturing_by_default: true,
        opt_out_capturing_persistence_type: "localStorage",
        persistence: "localStorage",
        person_profiles: "never",
        advanced_disable_flags: true,
        autocapture: false,
        capture_pageview: "history_change",
        capture_pageleave: false,
        capture_exceptions: false,
        disable_session_recording: true,
        before_send: minimizeEventData,
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
      posthog.capture(eventName, properties);
    },
    [posthog],
  );

  return { posthog, capture };
}
