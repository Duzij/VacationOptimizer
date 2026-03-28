import type { OptimizeRequest, OptimizeResult } from "../types/models";
import {
  buildSearchParamsFromRequest,
  parseRequestFromSearchParams,
  requestsMatch,
} from "./optimizationRequest";
const savedRequestStorageKey = "vacationOptimizer.v2.savedRequest";
const savedResultStorageKey = "vacationOptimizer.v2.savedResult";

export function getCanonicalAppPath(isDevelopment = import.meta.env.DEV) {
  return isDevelopment ? "/" : "/app";
}

export function normalizeCanonicalAppPath(isDevelopment = import.meta.env.DEV) {
  const canonicalPath = getCanonicalAppPath(isDevelopment);
  const normalizedPathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (normalizedPathname === canonicalPath) {
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

    return JSON.parse(raw) as OptimizeResult;
  } catch {
    return null;
  }
}

export function persistOptimization(request: OptimizeRequest, result: OptimizeResult) {
  window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(request));
  window.localStorage.setItem(savedResultStorageKey, JSON.stringify(result));
}

export function updateUrlFromRequest(request: OptimizeRequest | null) {
  const params = buildSearchParamsFromRequest(request);

  const nextUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  window.history.replaceState(null, "", nextUrl);
}

export function getInitialOptimizationState() {
  const initialRequest = parseRequestFromUrl() ?? readSavedRequest();
  const cachedResult = readSavedResult();
  const cachedRequest = readSavedRequest();

  return {
    initialRequest,
    initialResult: initialRequest && cachedResult && requestsMatch(initialRequest, cachedRequest)
      ? cachedResult
      : null,
  };
}
