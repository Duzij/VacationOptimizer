(function () {
  "use strict";

  var storageKey = "vacationOptimizer.cookieConsent.v1";
  var changeEvent = "vacationOptimizer:cookie-consent-change";
  var openEvent = "vacationOptimizer:open-cookie-settings";
  var adsenseClient = "ca-pub-9485445500768000";
  var consent = readConsent();

  function readConsent() {
    try {
      var storedValue = window.localStorage.getItem(storageKey);
      if (!storedValue) return null;

      var parsedValue = JSON.parse(storedValue);
      if (typeof parsedValue.analytics !== "boolean" || typeof parsedValue.advertising !== "boolean") {
        return null;
      }

      return parsedValue;
    } catch (_) {
      return null;
    }
  }

  function saveConsent(nextConsent) {
    consent = {
      version: 1,
      analytics: Boolean(nextConsent.analytics),
      advertising: Boolean(nextConsent.advertising),
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(consent));
    } catch (_) {
      // The choice still applies for this page when storage is unavailable.
    }

    updateGoogleConsent(consent.advertising);
    if (consent.advertising) loadAdsense();
    window.dispatchEvent(new CustomEvent(changeEvent, { detail: consent }));
    render();
  }

  function updateGoogleConsent(hasAdvertisingConsent) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("consent", "update", {
      ad_storage: hasAdvertisingConsent ? "granted" : "denied",
      ad_user_data: hasAdvertisingConsent ? "granted" : "denied",
      ad_personalization: hasAdvertisingConsent ? "granted" : "denied",
      analytics_storage: "denied",
    });
  }

  function loadAdsense() {
    if (document.getElementById("vacation-optimizer-adsense")) return;

    var script = document.createElement("script");
    script.id = "vacation-optimizer-adsense";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + adsenseClient;
    document.head.appendChild(script);
  }

  function createDialog() {
    var dialog = document.createElement("section");
    dialog.id = "cookie-preferences";
    dialog.className = "cookie-preferences";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-labelledby", "cookie-preferences-title");
    dialog.hidden = true;
    dialog.innerHTML = [
      '<div class="cookie-preferences__notice" data-cookie-notice>',
      '  <div class="cookie-preferences__copy">',
      '    <h2 id="cookie-preferences-title">Your privacy choices</h2>',
      '    <p>We use optional analytics from PostHog and optional advertising technologies from Google AdSense. You can accept, reject, or choose each purpose. The planner works either way.</p>',
      '    <a href="/privacy">Read the privacy and cookie policy</a>',
      "  </div>",
      '  <div class="cookie-preferences__actions">',
      '    <button type="button" class="cookie-preferences__button" data-cookie-reject>Reject optional</button>',
      '    <button type="button" class="cookie-preferences__button" data-cookie-accept>Accept optional</button>',
      '    <button type="button" class="cookie-preferences__text-button" data-cookie-manage>Manage choices</button>',
      "  </div>",
      "</div>",
      '<form class="cookie-preferences__form" data-cookie-form hidden>',
      '  <div class="cookie-preferences__copy">',
      '    <h2>Cookie settings</h2>',
      '    <p>Necessary browser storage keeps the planner and your saved preferences working. It is always on.</p>',
      "  </div>",
      '  <label class="cookie-preferences__option">',
      '    <span><strong>Analytics</strong><small>PostHog measures page and planner interactions after you opt in.</small></span>',
      '    <input type="checkbox" name="analytics">',
      "  </label>",
      '  <label class="cookie-preferences__option">',
      '    <span><strong>Advertising</strong><small>Google AdSense may use storage to show and measure ads after you opt in.</small></span>',
      '    <input type="checkbox" name="advertising">',
      "  </label>",
      '  <div class="cookie-preferences__actions">',
      '    <button type="button" class="cookie-preferences__button" data-cookie-reject>Reject optional</button>',
      '    <button type="submit" class="cookie-preferences__button">Save choices</button>',
      "  </div>",
      "</form>",
    ].join("");

    document.body.appendChild(dialog);
    return dialog;
  }

  function render() {
    var dialog = document.getElementById("cookie-preferences") || createDialog();
    var notice = dialog.querySelector("[data-cookie-notice]");
    var form = dialog.querySelector("[data-cookie-form]");
    var analyticsInput = form.elements.analytics;
    var advertisingInput = form.elements.advertising;

    analyticsInput.checked = Boolean(consent && consent.analytics);
    advertisingInput.checked = Boolean(consent && consent.advertising);

    if (consent) {
      dialog.hidden = true;
      notice.hidden = true;
      form.hidden = false;
    } else {
      dialog.hidden = false;
      notice.hidden = false;
      form.hidden = true;
    }
  }

  function openPreferences() {
    var dialog = document.getElementById("cookie-preferences") || createDialog();
    var notice = dialog.querySelector("[data-cookie-notice]");
    var form = dialog.querySelector("[data-cookie-form]");
    var analyticsInput = form.elements.analytics;
    var advertisingInput = form.elements.advertising;

    analyticsInput.checked = Boolean(consent && consent.analytics);
    advertisingInput.checked = Boolean(consent && consent.advertising);
    dialog.hidden = false;
    notice.hidden = true;
    form.hidden = false;
    form.querySelector("input").focus();
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-cookie-reject], [data-cookie-accept], [data-cookie-manage], [data-cookie-settings]");
    if (!target) return;

    if (target.hasAttribute("data-cookie-reject")) {
      saveConsent({ analytics: false, advertising: false });
      return;
    }

    if (target.hasAttribute("data-cookie-accept")) {
      saveConsent({ analytics: true, advertising: true });
      return;
    }

    openPreferences();
  });

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form.matches("[data-cookie-form]")) return;

    event.preventDefault();
    saveConsent({
      analytics: form.elements.analytics.checked,
      advertising: form.elements.advertising.checked,
    });
  });

  window.addEventListener(openEvent, openPreferences);
  window.VacationOptimizerCookieConsent = {
    getConsent: function () { return consent; },
    openPreferences: openPreferences,
  };

  updateGoogleConsent(Boolean(consent && consent.advertising));
  if (consent && consent.advertising) loadAdsense();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
}());
