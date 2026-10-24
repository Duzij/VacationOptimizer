import type { OptimizeRequest } from "./types/models";

export const defaultVacationDays = 25;
export const defaultMinimumDaysPerRange = 3;
export const defaultMaximumDaysPerRange = 21;
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