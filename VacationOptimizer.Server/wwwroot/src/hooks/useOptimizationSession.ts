import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useOptimize } from "../api/vacationApi";
import type { CustomFreeDay, OptimizeRequest, OptimizeResult } from "../types/models";
import { getInitialOptimizationState, persistOptimization, updateUrlFromRequest } from "../utils/optimizationPersistence";
import { hasSameHolidayScope, normalizeOptimizeRequest, withIgnoredHolidayDates } from "../utils/optimizationRequest";

export interface OptimizationRunOptions {
  showLoading?: boolean;
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

  const [result, setResult] = useState<OptimizeResult | null>(initialStateRef.current.initialResult);
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(initialStateRef.current.initialRequest);
  const [ignoredHolidayDates, setIgnoredHolidayDates] = useState<string[]>(
    initialStateRef.current.initialRequest?.ignoredHolidayDates ?? [],
  );
  const [customFreeDays, setCustomFreeDays] = useState<CustomFreeDay[]>(
    initialStateRef.current.initialRequest?.customFreeDays ?? [],
  );

  const executeOptimization = useEffectEvent(async (
    req: OptimizeRequest,
    overrideIgnoredHolidayDates?: string[],
    options?: OptimizationRunOptions,
  ) => {
    const normalizedRequest = normalizeOptimizeRequest(req);
    const nextIgnoredHolidayDates = hasSameHolidayScope(activeRequest, normalizedRequest) ? ignoredHolidayDates : [];
    const effectiveIgnoredHolidayDates = overrideIgnoredHolidayDates ?? nextIgnoredHolidayDates;
    const showLoading = options?.showLoading ?? true;

    if (!hasSameHolidayScope(activeRequest, normalizedRequest) && ignoredHolidayDates.length > 0 && !overrideIgnoredHolidayDates) {
      setIgnoredHolidayDates([]);
    }

    const requestWithIgnoredDates = withIgnoredHolidayDates(normalizedRequest, effectiveIgnoredHolidayDates);

    setActiveRequest(requestWithIgnoredDates);
    updateUrlFromRequest(requestWithIgnoredDates);

    if (showLoading) {
      setIsUserOptimizing(true);
    }

    try {
      const data = await optimize.mutateAsync(requestWithIgnoredDates);
      setResult(data);
      persistOptimization(requestWithIgnoredDates, data);

      return { data, request: requestWithIgnoredDates };
    } finally {
      if (showLoading) {
        setIsUserOptimizing(false);
      }
    }
  });

  const runOptimization = useEffectEvent<RunOptimization>((req, overrideIgnoredHolidayDates, options) =>
    executeOptimization(req, overrideIgnoredHolidayDates, options));

  const restoreOptimization = useEffectEvent(async (req: OptimizeRequest) =>
    executeOptimization(req, undefined, { showLoading: false }));

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

  return {
    initialRequest: initialStateRef.current.initialRequest,
    result,
    activeRequest,
    ignoredHolidayDates,
    setIgnoredHolidayDates,
    customFreeDays,
    setCustomFreeDays,
    isUserOptimizing,
    optimize,
    restoreOptimization,
    runOptimization,
  };
}
