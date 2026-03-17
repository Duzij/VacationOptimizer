import type { OptimizeRequest } from "./types/models";

export const defaultVacationDays = 25;
export const defaultMinimumDaysPerRange = 4;
export const defaultMaximumDaysPerRange = 14;
export function getDefaultYear() {
  return new Date().getFullYear();
}

export function getDefaultOptimizerRequest(year: number): OptimizeRequest {
  return {
    country: "",
    year,
    vacationDays: defaultVacationDays,
    minimumDaysPerRange: defaultMinimumDaysPerRange,
    maximumDaysPerRange: defaultMaximumDaysPerRange,
  };
}

export function hasNonDefaultAdvancedSettings(request: Partial<OptimizeRequest> | null | undefined) {
  if (!request) {
    return false;
  }

  return (request.minimumDaysPerRange ?? defaultMinimumDaysPerRange) !== defaultMinimumDaysPerRange
    || (request.maximumDaysPerRange ?? defaultMaximumDaysPerRange) !== defaultMaximumDaysPerRange
    || (request.customFreeDays?.length ?? 0) > 0;
}
