import posthog from "posthog-js";
import type { CaptureResult } from "posthog-js";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
const consentStorageKey = "vacationOptimizer.cookieConsent.v1";
const consentChangeEvent = "vacationOptimizer:cookie-consent-change";

let isAnalyticsEnabled: boolean | null = null;

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

function setAnalyticsConsent(hasConsent: boolean) {
  if (hasConsent === isAnalyticsEnabled) {
    return;
  }

  isAnalyticsEnabled = hasConsent;
  if (!hasConsent) {
    posthog.opt_out_capturing();
    return;
  }

  posthog.opt_in_capturing({ captureEventName: false });
  posthog.capture("$pageview");
}

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2026-05-30",
    opt_out_capturing_by_default: true,
    opt_out_capturing_persistence_type: "localStorage",
    persistence: "localStorage",
    person_profiles: "never",
    autocapture: false,
    capture_pageview: "history_change",
    capture_pageleave: false,
    capture_exceptions: false,
    disable_session_recording: true,
    before_send: minimizeEventData,
  });

  setAnalyticsConsent(hasSavedAnalyticsConsent());
  window.addEventListener(consentChangeEvent, (event) => {
    const consent = (event as CustomEvent<{ analytics?: unknown }>).detail;
    setAnalyticsConsent(consent?.analytics === true);
  });
}

export default posthog;
