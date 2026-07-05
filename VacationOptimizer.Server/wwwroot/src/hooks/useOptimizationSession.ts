import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { type ApiError, useOptimize } from "../api/vacationApi";
import type { CustomFreeDay, OptimizeRequest, OptimizeResult } from "../types/models";
import { getInitialOptimizationState, persistOptimization, updateUrlFromRequest } from "../utils/optimizationPersistence";
import { getOptimizationResultFingerprint } from "../utils/optimizationResult";
import { hasSameHolidayScope, normalizeOptimizeRequest, requestsMatch, withIgnoredHolidayDates } from "../utils/optimizationRequest";

export const MAX_SHUFFLE_HISTORY = 50;

export interface OptimizationRunOptions {
  showLoading?: boolean;
  includeResultTokens?: boolean;
  replaceHistory?: boolean;
}

export interface RunOptimization {
  (
    req: OptimizeRequest,
    overrideIgnoredHolidayDates?: string[],
    options?: OptimizationRunOptions,
  ): Promise<{ data: OptimizeResult; request: OptimizeRequest }>;
}

export function useOptimizationSession() {
  const initialStateRef = useRef(getInitialOptimizationState());
  const didRestoreInitialRequestRef = useRef(false);
  const optimize = useOptimize();
  const [isUserOptimizing, setIsUserOptimizing] = useState(false);
  const initialResultHistory = initialStateRef.current.initialResult ? [initialStateRef.current.initialResult] : [];

  const [resultHistory, setResultHistory] = useState<OptimizeResult[]>(initialResultHistory);
  const [activeResultIndex, setActiveResultIndex] = useState(initialResultHistory.length > 0 ? 0 : -1);
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(initialStateRef.current.initialRequest);
  const [ignoredHolidayDates, setIgnoredHolidayDates] = useState<string[]>(
    initialStateRef.current.initialRequest?.ignoredHolidayDates ?? [],
  );
  const [customFreeDays, setCustomFreeDays] = useState<CustomFreeDay[]>(
    initialStateRef.current.initialRequest?.customFreeDays ?? [],
  );
  const [hasExhaustedShuffleResults, setHasExhaustedShuffleResults] = useState(false);
  const [neverHolidayDates, setNeverHolidayDates] = useState<string[]>(
    initialStateRef.current.initialRequest?.neverHolidayDates ?? [],
  );
  const [lockedVacationDates, setLockedVacationDates] = useState<string[]>(
    initialStateRef.current.initialRequest?.lockedVacationDates ?? [],
  );
  const resultHistoryRef = useRef<OptimizeResult[]>(initialResultHistory);
  const activeResultIndexRef = useRef(initialResultHistory.length > 0 ? 0 : -1);

  const setResultHistoryState = useCallback((history: OptimizeResult[], index: number) => {
    resultHistoryRef.current = history;
    activeResultIndexRef.current = index;
    setResultHistory(history);
    setActiveResultIndex(index);
  }, []);

  const getKnownResultTokens = useCallback(() => (
    resultHistoryRef.current
      .map((entry) => entry.resultToken)
      .filter(Boolean)
      .slice(-MAX_SHUFFLE_HISTORY)
  ), []);

  const withSeedToken = useCallback((request: OptimizeRequest, result: OptimizeResult): OptimizeRequest => ({
    ...request,
    seedToken: result.resultToken || undefined,
  }), []);

  const withoutSeedToken = useCallback((request: OptimizeRequest): OptimizeRequest => {
    const { seedToken: _seedToken, ...requestWithoutSeedToken } = request;
    return requestWithoutSeedToken;
  }, []);

  const addUsedResultTokens = useCallback((request: OptimizeRequest): OptimizeRequest => {
    const knownTokens = getKnownResultTokens();

    return {
      ...request,
      usedResultTokens: knownTokens.length > 0
        ? knownTokens
        : undefined,
    };
  }, [getKnownResultTokens]);

  const replaceResultHistory = useCallback((nextResult: OptimizeResult) => {
    setResultHistoryState([nextResult], 0);
  }, [setResultHistoryState]);

  const appendResultHistory = useCallback((nextResult: OptimizeResult) => {
    const existingIndex = resultHistoryRef.current.findIndex((entry) => entry.resultToken === nextResult.resultToken);
    if (existingIndex >= 0) {
      setResultHistoryState(resultHistoryRef.current, existingIndex);
      return;
    }

    const nextFingerprint = getOptimizationResultFingerprint(nextResult);
    const duplicateContentIndex = resultHistoryRef.current.findIndex((entry) =>
      getOptimizationResultFingerprint(entry) === nextFingerprint);
    if (duplicateContentIndex >= 0) {
      const nextHistory = [...resultHistoryRef.current];
      nextHistory[duplicateContentIndex] = nextResult;
      setResultHistoryState(nextHistory, duplicateContentIndex);
      return;
    }

    const nextHistory = [...resultHistoryRef.current, nextResult].slice(-MAX_SHUFFLE_HISTORY);
    setResultHistoryState(nextHistory, nextHistory.length - 1);
  }, [setResultHistoryState]);

  const clearResultHistory = useCallback(() => {
    setHasExhaustedShuffleResults(false);
    setResultHistoryState([], -1);
  }, [setResultHistoryState]);

  const markShuffleExhaustedIfNeeded = useCallback((error: unknown) => {
    if ((error as ApiError | undefined)?.status === 409) {
      setHasExhaustedShuffleResults(true);
    }
  }, []);

  useEffect(() => {
    const handleClearSession = () => {
      clearResultHistory();
      setActiveRequest(null);
    };
    window.addEventListener("vacationOptimizer.clearSession", handleClearSession);
    return () => window.removeEventListener("vacationOptimizer.clearSession", handleClearSession);
  }, [clearResultHistory]);

  const result = activeResultIndex >= 0 ? resultHistory[activeResultIndex] ?? null : null;
  const canNavigatePrevious = activeResultIndex > 0;
  const canNavigateNext = activeResultIndex >= 0 && activeResultIndex < resultHistory.length - 1;
  const hasReachedShuffleLimit = hasExhaustedShuffleResults || resultHistory.length >= MAX_SHUFFLE_HISTORY;
  const hasLockedBudgetLimit = lockedVacationDates.length > 0
    && lockedVacationDates.length >= (activeRequest?.vacationDays ?? Infinity);

  const navigatePreviousResult = useCallback(() => {
    if (!activeRequest || activeResultIndexRef.current <= 0) {
      return;
    }

    const nextIndex = activeResultIndexRef.current - 1;
    const nextResult = resultHistoryRef.current[nextIndex];
    if (!nextResult) {
      return;
    }

    activeResultIndexRef.current = nextIndex;
    setActiveResultIndex(nextIndex);
    const seededRequest = withSeedToken(activeRequest, nextResult);
    setActiveRequest(seededRequest);
    persistOptimization(seededRequest, nextResult);
    updateUrlFromRequest(seededRequest);
  }, [activeRequest, withSeedToken]);

  const navigateNextResult = useCallback(() => {
    if (!activeRequest || activeResultIndexRef.current >= resultHistoryRef.current.length - 1) {
      return;
    }

    const nextIndex = activeResultIndexRef.current + 1;
    const nextResult = resultHistoryRef.current[nextIndex];
    if (!nextResult) {
      return;
    }

    activeResultIndexRef.current = nextIndex;
    setActiveResultIndex(nextIndex);
    const seededRequest = withSeedToken(activeRequest, nextResult);
    setActiveRequest(seededRequest);
    persistOptimization(seededRequest, nextResult);
    updateUrlFromRequest(seededRequest);
  }, [activeRequest, withSeedToken]);

  const executeOptimization = useEffectEvent(async (
    req: OptimizeRequest,
    overrideIgnoredHolidayDates?: string[],
    options?: OptimizationRunOptions,
  ) => {
    const normalizedRequest = normalizeOptimizeRequest(req);
    const nextIgnoredHolidayDates = hasSameHolidayScope(activeRequest, normalizedRequest) ? ignoredHolidayDates : [];
    const nextNeverHolidayDates = normalizedRequest.neverHolidayDates
      ?? (hasSameHolidayScope(activeRequest, normalizedRequest) ? neverHolidayDates : []);
    const nextLockedVacationDates = normalizedRequest.lockedVacationDates
      ?? (hasSameHolidayScope(activeRequest, normalizedRequest) ? lockedVacationDates : []);
    const effectiveIgnoredHolidayDates = overrideIgnoredHolidayDates ?? nextIgnoredHolidayDates;
    const showLoading = options?.showLoading ?? true;

    if (!hasSameHolidayScope(activeRequest, normalizedRequest) && ignoredHolidayDates.length > 0 && !overrideIgnoredHolidayDates) {
      setIgnoredHolidayDates([]);
    }

    if (!hasSameHolidayScope(activeRequest, normalizedRequest) && neverHolidayDates.length > 0) {
      setNeverHolidayDates([]);
    }

    if (!hasSameHolidayScope(activeRequest, normalizedRequest) && lockedVacationDates.length > 0) {
      setLockedVacationDates([]);
    }

    const requestWithIgnoredDates = normalizeOptimizeRequest({
      ...withIgnoredHolidayDates(normalizedRequest, effectiveIgnoredHolidayDates),
      neverHolidayDates: nextNeverHolidayDates.length > 0 ? nextNeverHolidayDates : undefined,
      lockedVacationDates: nextLockedVacationDates.length > 0 ? nextLockedVacationDates : undefined,
    });
    const keepResultHistory = requestsMatch(activeRequest, requestWithIgnoredDates);
    if (!keepResultHistory) {
      setHasExhaustedShuffleResults(false);
    }
    const shouldIncludeResultTokens = options?.includeResultTokens ?? keepResultHistory;
    const requestForApi = shouldIncludeResultTokens
      ? addUsedResultTokens(requestWithIgnoredDates)
      : requestWithIgnoredDates;

    setActiveRequest(requestWithIgnoredDates);
    updateUrlFromRequest(requestWithIgnoredDates);

    if (showLoading) {
      setIsUserOptimizing(true);
    }

    try {
      const data = await optimize.mutateAsync(requestForApi);
      setHasExhaustedShuffleResults(false);
      const seededRequest = withSeedToken(requestWithIgnoredDates, data);
      setActiveRequest(seededRequest);
      updateUrlFromRequest(seededRequest);
      persistOptimization(seededRequest, data);

      if (options?.replaceHistory || !keepResultHistory) {
        replaceResultHistory(data);
      } else {
        appendResultHistory(data);
      }

      return { data, request: seededRequest };
    } catch (error) {
      markShuffleExhaustedIfNeeded(error);
      throw error;
    } finally {
      if (showLoading) {
        setIsUserOptimizing(false);
      }
    }
  });

  const runOptimization = useEffectEvent<RunOptimization>((req, overrideIgnoredHolidayDates, options) =>
    executeOptimization(req, overrideIgnoredHolidayDates, options));

  const restoreOptimization = useEffectEvent(async (req: OptimizeRequest) =>
    executeOptimization(req, undefined, {
      showLoading: false,
      includeResultTokens: false,
      replaceHistory: true,
    }));

  useEffect(() => {
    const initialRequest = initialStateRef.current.initialRequest;
    if (!initialRequest || didRestoreInitialRequestRef.current) {
      return;
    }

    didRestoreInitialRequestRef.current = true;
    updateUrlFromRequest(initialRequest);

    void restoreOptimization(initialRequest).catch(() => {
      // Keep any cached result visible if refresh fails; the mutation error UI handles messaging.
    });
  }, [restoreOptimization]);

  const shuffleOptimization = useCallback(async () => {
    if (!activeRequest) {
      return;
    }

    setIsUserOptimizing(true);
    try {
      const shuffleRequest = addUsedResultTokens(withoutSeedToken(activeRequest));

      const data = await optimize.mutateAsync(shuffleRequest);
      setHasExhaustedShuffleResults(false);
      const seededRequest = withSeedToken(withoutSeedToken(activeRequest), data);
      setActiveRequest(seededRequest);
      updateUrlFromRequest(seededRequest);
      persistOptimization(seededRequest, data);

      appendResultHistory(data);
    } catch (error) {
      markShuffleExhaustedIfNeeded(error);
      throw error;
    } finally {
      setIsUserOptimizing(false);
    }
  }, [activeRequest, addUsedResultTokens, appendResultHistory, markShuffleExhaustedIfNeeded, optimize, withSeedToken, withoutSeedToken]);

  return {
    initialRequest: initialStateRef.current.initialRequest,
    initialCalendarName: initialStateRef.current.initialCalendarName,
    initialConnectedToken: initialStateRef.current.initialConnectedToken,
    initialConnectedCalendarName: initialStateRef.current.initialConnectedCalendarName,
    initialConnectedCalendarYear: initialStateRef.current.initialConnectedCalendarYear,
    hasStoredPlannerState: initialStateRef.current.hasStoredPlannerState,
    result,
    activeRequest,
    ignoredHolidayDates,
    setIgnoredHolidayDates,
    neverHolidayDates,
    setNeverHolidayDates,
    lockedVacationDates,
    setLockedVacationDates,
    customFreeDays,
    setCustomFreeDays,
    isUserOptimizing,
    canNavigatePrevious,
    canNavigateNext,
    optimize,
    restoreOptimization,
    runOptimization,
    shuffleOptimization,
    navigatePreviousResult,
    navigateNextResult,
    hasReachedShuffleLimit,
    hasLockedBudgetLimit,
  };
}
