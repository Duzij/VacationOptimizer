import type { OptimizeRequest, OptimizeResult } from "../types/models";
import {
  buildSearchParamsFromRequest,
  parseRequestFromSearchParams,
  requestsMatch,
} from "./optimizationRequest";
export const savedRequestStorageKey = "vacationOptimizer.v2.savedRequest";
export const savedResultStorageKey = "vacationOptimizer.v2.savedResult";
export const calendarNameStorageKey = "vacationOptimizer.v2.calendarName";
export const connectedTokenStorageKey = "vacationOptimizer.v2.connectedToken";
export const connectedCalendarNameStorageKey = "vacationOptimizer.v2.connectedCalendarName";
export const connectedCalendarYearStorageKey = "vacationOptimizer.v2.connectedCalendarYear";
export const connectRedirectFlagStorageKey = "vacationOptimizer.v2.connectRedirected";
export const themeStorageKey = "theme";

interface ConnectedCalendarState {
  connectedToken: string;
  connectedCalendarName: string;
  connectedCalendarYear?: string;
}

interface UpdateUrlOptions {
  connectedToken?: string | null;
  connectedCalendarName?: string | null;
  pathname?: string;
  connectedCalendarYear?: string | null;
}

function normalizeStoredString(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function hasUsablePlannerSeed(result: Partial<OptimizeResult> | null | undefined): result is OptimizeResult {
  return Boolean(
    result
    && typeof result.plannerSeed === "string"
    && result.plannerSeed.trim()
    && result.plannerSeed.trim().toLowerCase() !== "undefined",
  );
}

export function getCanonicalAppPath(isDevelopment = import.meta.env.DEV) {
  return isDevelopment ? "/" : "/app";
}

export function normalizeCanonicalAppPath(isDevelopment = import.meta.env.DEV) {
  const canonicalPath = getCanonicalAppPath(isDevelopment);
  const normalizedPathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPathname === canonicalPath) {
    return;
  }

  // Once the public marketing/legal pages exist, the app should only
  // normalize its own entry path instead of hijacking unrelated URLs.
  if (!isDevelopment && !normalizedPathname.startsWith(`${canonicalPath}/`)) {
    return;
  }

  const nextUrl = `${canonicalPath}${window.location.search}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

export function parseRequestFromUrl(): OptimizeRequest | null {
  return parseRequestFromSearchParams(new URLSearchParams(window.location.search));
}

export function readSavedRequest(): OptimizeRequest | null {
  try {
    const raw = window.localStorage.getItem(savedRequestStorageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as OptimizeRequest;
  } catch {
    return null;
  }
}

export function readSavedResult(): OptimizeResult | null {
  try {
    const raw = window.localStorage.getItem(savedResultStorageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<OptimizeResult>;
    if (!hasUsablePlannerSeed(parsed)) {
      window.localStorage.removeItem(savedResultStorageKey);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readSavedCalendarName() {
  return normalizeStoredString(window.localStorage.getItem(calendarNameStorageKey));
}

export function persistCalendarName(name: string) {
  const normalizedName = normalizeStoredString(name);

  if (!normalizedName) {
    window.localStorage.removeItem(calendarNameStorageKey);
    return;
  }

  window.localStorage.setItem(calendarNameStorageKey, normalizedName);
}

export function readConnectedCalendar(): ConnectedCalendarState {
  return {
    connectedToken: normalizeStoredString(window.localStorage.getItem(connectedTokenStorageKey)),
    connectedCalendarName: normalizeStoredString(window.localStorage.getItem(connectedCalendarNameStorageKey)),
    connectedCalendarYear: normalizeStoredString(window.localStorage.getItem(connectedCalendarYearStorageKey)),
  };
}

export function readConnectedCalendarFromUrl(): ConnectedCalendarState {
  const params = new URLSearchParams(window.location.search);

  return {
    connectedToken: normalizeStoredString(params.get("connectedToken")),
    connectedCalendarName: normalizeStoredString(params.get("connectedCalendarName")),
    connectedCalendarYear: normalizeStoredString(params.get("connectedCalendarYear")),
  };
}

export function persistConnectedCalendar(connectedToken: string, connectedCalendarName?: string | null, connectedCalendarYear?: string | null) {
  const normalizedToken = normalizeStoredString(connectedToken);
  const normalizedCalendarName = normalizeStoredString(connectedCalendarName);
  const normalizedCalendarYear = normalizeStoredString(connectedCalendarYear);

  if (!normalizedToken) {
    clearConnectedCalendar();
    return;
  }

  window.localStorage.setItem(connectedTokenStorageKey, normalizedToken);

  if (normalizedCalendarName) {
    window.localStorage.setItem(connectedCalendarNameStorageKey, normalizedCalendarName);
  } else {
    window.localStorage.removeItem(connectedCalendarNameStorageKey);
  }

  if (normalizedCalendarYear) {
    window.localStorage.setItem(connectedCalendarYearStorageKey, normalizedCalendarYear);
  } else {
    window.localStorage.removeItem(connectedCalendarYearStorageKey);
  }
}

export function clearConnectedCalendar() {
  window.localStorage.removeItem(connectedTokenStorageKey);
  window.localStorage.removeItem(connectedCalendarNameStorageKey);
  window.localStorage.removeItem(connectedCalendarYearStorageKey);
}

export function markConnectRedirected() {
  window.sessionStorage.setItem(connectRedirectFlagStorageKey, "1");
}

export function hasConnectRedirectFlag() {
  return window.sessionStorage.getItem(connectRedirectFlagStorageKey) === "1";
}

export function clearConnectRedirectFlag() {
  window.sessionStorage.removeItem(connectRedirectFlagStorageKey);
}

export function consumeConnectRedirectFlag() {
  const redirected = hasConnectRedirectFlag();
  clearConnectRedirectFlag();
  return redirected;
}

export function persistOptimization(request: OptimizeRequest, result: OptimizeResult) {
  window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(request));
  window.localStorage.setItem(savedResultStorageKey, JSON.stringify(result));
}

export function clearStoredOptimizationData() {
  window.localStorage.removeItem(savedRequestStorageKey);
  window.localStorage.removeItem(savedResultStorageKey);
}

export function clearAppLocalStorage() {
  clearStoredOptimizationData();
  clearConnectedCalendar();
  window.localStorage.removeItem(calendarNameStorageKey);
  window.localStorage.removeItem(themeStorageKey);
  window.sessionStorage.clear();
  window.dispatchEvent(new Event("vacationOptimizer.clearSession"));
}

export function hasAppLocalStorageData() {
  return [
    savedRequestStorageKey,
    savedResultStorageKey,
    calendarNameStorageKey,
    connectedTokenStorageKey,
    connectedCalendarNameStorageKey,
    connectedCalendarYearStorageKey,
    themeStorageKey,
  ].some((key) => window.localStorage.getItem(key) !== null);
}

export function updateUrlFromRequest(request: OptimizeRequest | null, options: UpdateUrlOptions = {}) {
  const params = buildSearchParamsFromRequest(request);
  const savedConnectedCalendar = readConnectedCalendar();
  const connectedToken = Object.prototype.hasOwnProperty.call(options, "connectedToken")
    ? normalizeStoredString(options.connectedToken)
    : savedConnectedCalendar.connectedToken;
  const connectedCalendarName = Object.prototype.hasOwnProperty.call(options, "connectedCalendarName")
    ? normalizeStoredString(options.connectedCalendarName)
    : savedConnectedCalendar.connectedCalendarName;
  const connectedCalendarYear = Object.prototype.hasOwnProperty.call(options, "connectedCalendarYear")
    ? normalizeStoredString((options as any).connectedCalendarYear)
    : savedConnectedCalendar.connectedCalendarYear;

  if (connectedToken) {
    params.set("connectedToken", connectedToken);
  }

  if (connectedCalendarName) {
    params.set("connectedCalendarName", connectedCalendarName);
  }

  if (connectedCalendarYear) {
    params.set("connectedCalendarYear", connectedCalendarYear);
  }

  const pathname = options.pathname ?? window.location.pathname;

  const nextUrl = params.toString()
    ? `${pathname}?${params.toString()}`
    : pathname;
  window.history.replaceState(null, "", nextUrl);
}

export function getInitialOptimizationState() {
  const initialRequest = parseRequestFromUrl() ?? readSavedRequest();
  const cachedResult = readSavedResult();
  const cachedRequest = readSavedRequest();
  const connectedCalendarFromUrl = readConnectedCalendarFromUrl();
  const storedConnectedCalendar = readConnectedCalendar();
  const connectedCalendar = {
    connectedToken: connectedCalendarFromUrl.connectedToken || storedConnectedCalendar.connectedToken,
    connectedCalendarName: connectedCalendarFromUrl.connectedCalendarName || storedConnectedCalendar.connectedCalendarName,
    connectedCalendarYear: connectedCalendarFromUrl.connectedCalendarYear || storedConnectedCalendar.connectedCalendarYear,
  };

  if (connectedCalendarFromUrl.connectedToken) {
    persistConnectedCalendar(
      connectedCalendar.connectedToken,
      connectedCalendar.connectedCalendarName,
      connectedCalendar.connectedCalendarYear,
    );
  }

  return {
    initialRequest,
    initialResult: initialRequest && cachedResult && requestsMatch(initialRequest, cachedRequest)
      ? cachedResult
      : null,
    initialCalendarName: readSavedCalendarName(),
    initialConnectedToken: connectedCalendar.connectedToken,
    initialConnectedCalendarName: connectedCalendar.connectedCalendarName,
    initialConnectedCalendarYear: connectedCalendar.connectedCalendarYear,
    hasStoredPlannerState: Boolean(initialRequest || cachedRequest || cachedResult),
  };
}
