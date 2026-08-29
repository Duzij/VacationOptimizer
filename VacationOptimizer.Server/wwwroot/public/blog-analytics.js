/*
 * Lightweight, consent-aware page-view tracking for the statically generated
 * blog pages (blog index + blog posts). The React app uses the full PostHog
 * SDK; these static pages do not boot React, so they send a single "$pageview"
 * event directly to the PostHog capture endpoint instead.
 *
 * Privacy behavior mirrors the app:
 *   - No event is sent until the visitor has granted analytics consent.
 *   - No person profiles are created ($process_person_profile: false).
 *   - No user identity is collected; a fixed anonymous distinct_id is used.
 *   - Query strings and referrer information are not sent.
 */
(function () {
  "use strict";

  var API_KEY = "phc_DeREyGXVhrKU9qb6LUmaq6gbCQwgt7J5khVoyo7smT3H";
  var API_HOST = "https://eu.i.posthog.com";
  var CONSENT_STORAGE_KEY = "vacationOptimizer.cookieConsent.v1";
  var CONSENT_CHANGE_EVENT = "vacationOptimizer:cookie-consent-change";

  function hasAnalyticsConsent() {
    try {
      var stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        return false;
      }

      var consent = JSON.parse(stored);
      return Boolean(consent && consent.analytics === true);
    } catch (_) {
      return false;
    }
  }

  function sendPageView() {
    var endpoint = API_HOST.replace(/\/+$/, "") + "/capture/";
    var payload = {
      api_key: API_KEY,
      event: "$pageview",
      properties: {
        distinct_id: "anonymous",
        $process_person_profile: false,
        $current_url: window.location.origin + window.location.pathname,
        $pathname: window.location.pathname,
        title: document.title,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      window.fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (_) {
      // Analytics must never break the page.
    }
  }

  if (hasAnalyticsConsent()) {
    sendPageView();
  }

  window.addEventListener(CONSENT_CHANGE_EVENT, function (event) {
    var detail = event && event.detail;
    if (detail && detail.analytics === true) {
      sendPageView();
    }
  });
})();