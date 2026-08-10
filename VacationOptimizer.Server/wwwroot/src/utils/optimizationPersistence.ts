import type { OptimizeRequest, OptimizeResult } from "../types/models";
import {
  buildSearchParamsFromRequest,
  normalizeOptimizeRequest,
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

export function getYearScopedStorageKey(storageKey: string, year: number) {
  return `${storageKey}.${year}`;
}

function getStorageYearFromRequest(request: OptimizeRequest | null | undefined) {
  if (!request || !Number.isFinite(request.year)) {
    return null;
  }

  return normalizeOptimizeRequest(request).year;
}

function getStorageYearFromUrl() {
  const rawYear = new URLSearchParams(window.location.search).get("year");
  if (!rawYear) {
    return null;
  }

  const parsedYear = Number(rawYear);
  return Number.isFinite(parsedYear) ? Math.trunc(parsedYear) : null;
}

function getCurrentUtcYear() {
  return new Date().getUTCFullYear();
}

function getRequestedStorageYear(year?: number | null) {
  return year ?? getStorageYearFromUrl() ?? getCurrentUtcYear();
}

function readStorageEntry(storageKey: string, year?: number | null) {
  if (year !== undefined && year !== null) {
    const scopedKey = getYearScopedStorageKey(storageKey, year);
    const scopedRaw = window.localStorage.getItem(scopedKey);
    if (scopedRaw) {
      return { key: scopedKey, raw: scopedRaw, scoped: true };
    }
  }

  const raw = window.localStorage.getItem(storageKey);
  return raw ? { key: storageKey, raw, scoped: false } : null;
}

function removeYearScopedStorage(storageKey: string) {
  const scopedPrefix = `${storageKey}.`;
  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key === storageKey || key?.startsWith(scopedPrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export function hasYearScopedStorageData(storageKey: string) {
  const scopedPrefix = `${storageKey}.`;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key === storageKey || key?.startsWith(scopedPrefix)) {
      return true;
    }
  }

  return false;
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

export function readSavedRequest(year?: number | null): OptimizeRequest | null {
  try {
    const requestedYear = getRequestedStorageYear(year);
    const entry = readStorageEntry(savedRequestStorageKey, requestedYear);
    if (!entry) {
      return null;
    }

    const request = normalizeOptimizeRequest(JSON.parse(entry.raw) as OptimizeRequest);
    if (requestedYear !== null && request.year !== requestedYear) {
      return null;
    }
    // console.log("readSavedRequest", entry.key, request);
    return request;
  } catch {
    return null;
  }
}

export function readSavedResult(year?: number | null): OptimizeResult | null {
  try {
    const requestedYear = getRequestedStorageYear(year);
    const entry = readStorageEntry(savedResultStorageKey, requestedYear);
    if (!entry) {
      return null;
    }

    const parsed = JSON.parse(entry.raw) as Partial<OptimizeResult>;
    if (!hasUsablePlannerSeed(parsed)) {
      window.localStorage.removeItem(entry.key);
      return null;
    }

    if (requestedYear !== null && !entry.scoped && !readSavedRequest(requestedYear)) {
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
  const normalizedRequest = normalizeOptimizeRequest(request);
  const storageYear = getStorageYearFromRequest(normalizedRequest);

  if (storageYear === null) {
    window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(normalizedRequest));
    window.localStorage.setItem(savedResultStorageKey, JSON.stringify(result));
    return;
  }

  window.localStorage.setItem(getYearScopedStorageKey(savedRequestStorageKey, storageYear), JSON.stringify(normalizedRequest));
  window.localStorage.setItem(getYearScopedStorageKey(savedResultStorageKey, storageYear), JSON.stringify(result));
}

export function clearStoredOptimizationData() {
  removeYearScopedStorage(savedRequestStorageKey);
  removeYearScopedStorage(savedResultStorageKey);
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
  return hasYearScopedStorageData(savedRequestStorageKey)
    || hasYearScopedStorageData(savedResultStorageKey)
    || [
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
    ? normalizeStoredString(options.connectedCalendarYear)
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
  const urlRequest = parseRequestFromUrl();
  const storageYear = getStorageYearFromRequest(urlRequest) ?? getRequestedStorageYear();
  const initialRequest = urlRequest ?? readSavedRequest(storageYear);
  const initialRequestYear = getStorageYearFromRequest(initialRequest) ?? storageYear;
  const cachedResult = readSavedResult(initialRequestYear);
  const cachedRequest = readSavedRequest(initialRequestYear);
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
