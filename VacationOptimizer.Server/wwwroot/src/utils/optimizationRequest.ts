import {
  isIndiaOptimizeRequest,
  isSpainOptimizeRequest,
  type CustomFreeDay,
  type IndiaOptimizeRequest,
  type OptimizeRequest,
  type SpainOptimizeRequest,
} from "../types/models";
import {
  defaultMaximumDaysPerRange,
  defaultMinimumDaysPerRange,
  defaultVacationDays,
  getDefaultYear,
} from "../optimizerDefaults";

const currentYear = getDefaultYear();
const minimumYear = currentYear;
const maximumYear = currentYear + 5;

function parseNumber(value: string | null, fallback: number) {
  if (value === null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function uniqueDates(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort();
}

function parseDateList(value: string | null) {
  if (!value) {
    return [];
  }

  return uniqueDates(value.split(","));
}

function normalizeCustomFreeDays(customFreeDays: CustomFreeDay[] | undefined) {
  if (!customFreeDays || customFreeDays.length === 0) {
    return undefined;
  }

  return uniqueDates(customFreeDays.map((day) => day.date)).map((date) => ({ date }));
}

function normalizeIgnoredHolidayDates(ignoredHolidayDates: string[] | undefined) {
  if (!ignoredHolidayDates || ignoredHolidayDates.length === 0) {
    return undefined;
  }

  return uniqueDates(ignoredHolidayDates);
}

function normalizeBaseFields(request: OptimizeRequest) {
  return {
    country: request.country.trim().toUpperCase(),
    year: clamp(request.year, minimumYear, maximumYear),
    vacationDays: clamp(request.vacationDays, 1, 40),
    minimumDaysPerRange: clamp(request.minimumDaysPerRange ?? defaultMinimumDaysPerRange, 1, 14),
    maximumDaysPerRange: clamp(request.maximumDaysPerRange ?? defaultMaximumDaysPerRange, 1, 31),
    customFreeDays: normalizeCustomFreeDays(request.customFreeDays),
    ignoredHolidayDates: normalizeIgnoredHolidayDates(request.ignoredHolidayDates),
    seed: request.seed,
    usedResultHashes: request.usedResultHashes,
  };
}

function normalizeIndiaRequest(request: IndiaOptimizeRequest): IndiaOptimizeRequest {
  const normalized = normalizeBaseFields(request);

  return {
    ...normalized,
    country: "IN",
    stateCode: request.stateCode.trim().toUpperCase(),
  };
}

function normalizeSpainRequest(request: SpainOptimizeRequest): SpainOptimizeRequest {
  const normalized = normalizeBaseFields(request);

  return {
    ...normalized,
    country: "ES",
    stateCode: request.stateCode?.trim().toUpperCase() || undefined,
    cityCode: request.cityCode?.trim().toUpperCase() || undefined,
  };
}

export function normalizeOptimizeRequest(request: OptimizeRequest): OptimizeRequest {
  if (isIndiaOptimizeRequest(request)) {
    return normalizeIndiaRequest(request);
  }

  if (isSpainOptimizeRequest(request)) {
    return normalizeSpainRequest(request);
  }

  const normalized = normalizeBaseFields(request);

  return {
    ...normalized,
    state: request.state?.trim().toUpperCase() || undefined,
  };
}

export function parseRequestFromSearchParams(params: URLSearchParams): OptimizeRequest | null {
  const country = params.get("country")?.trim().toUpperCase();

  if (!country) {
    return null;
  }

  if (country === "IN") {
    const stateCode = params.get("stateCode")?.trim().toUpperCase();
    if (!stateCode) {
      return null;
    }

    return normalizeIndiaRequest({
      country: "IN",
      stateCode,
      year: parseNumber(params.get("year"), currentYear),
      vacationDays: parseNumber(params.get("vacationDays"), defaultVacationDays),
      minimumDaysPerRange: parseNumber(params.get("minDays"), defaultMinimumDaysPerRange),
      maximumDaysPerRange: parseNumber(params.get("maxDays"), defaultMaximumDaysPerRange),
      customFreeDays: parseDateList(params.get("customDays")).map((date) => ({ date })),
      ignoredHolidayDates: parseDateList(params.get("ignoredHolidays")),
    });
  }

  if (country === "ES") {
    return normalizeSpainRequest({
      country: "ES",
      stateCode: params.get("stateCode")?.trim().toUpperCase() || undefined,
      cityCode: params.get("cityCode")?.trim().toUpperCase() || undefined,
      year: parseNumber(params.get("year"), currentYear),
      vacationDays: parseNumber(params.get("vacationDays"), defaultVacationDays),
      minimumDaysPerRange: parseNumber(params.get("minDays"), defaultMinimumDaysPerRange),
      maximumDaysPerRange: parseNumber(params.get("maxDays"), defaultMaximumDaysPerRange),
      customFreeDays: parseDateList(params.get("customDays")).map((date) => ({ date })),
      ignoredHolidayDates: parseDateList(params.get("ignoredHolidays")),
    });
  }

  return normalizeOptimizeRequest({
    country,
    state: params.get("state")?.trim().toUpperCase() || undefined,
    year: parseNumber(params.get("year"), currentYear),
    vacationDays: parseNumber(params.get("vacationDays"), defaultVacationDays),
    minimumDaysPerRange: parseNumber(params.get("minDays"), defaultMinimumDaysPerRange),
    maximumDaysPerRange: parseNumber(params.get("maxDays"), defaultMaximumDaysPerRange),
    customFreeDays: parseDateList(params.get("customDays")).map((date) => ({ date })),
    ignoredHolidayDates: parseDateList(params.get("ignoredHolidays")),
  });
}

export function buildSearchParamsFromRequest(request: OptimizeRequest | null) {
  const params = new URLSearchParams();

  if (!request) {
    return params;
  }

  const normalizedRequest = normalizeOptimizeRequest(request);
  params.set("country", normalizedRequest.country);

  if (normalizedRequest.year !== currentYear) {
    params.set("year", String(normalizedRequest.year));
  }

  if (normalizedRequest.vacationDays !== defaultVacationDays) {
    params.set("vacationDays", String(normalizedRequest.vacationDays));
  }

  if (isIndiaOptimizeRequest(normalizedRequest)) {
    params.set("stateCode", normalizedRequest.stateCode);
  } else if (isSpainOptimizeRequest(normalizedRequest)) {
    if (normalizedRequest.stateCode) {
      params.set("stateCode", normalizedRequest.stateCode);
    }
    if (normalizedRequest.cityCode) {
      params.set("cityCode", normalizedRequest.cityCode);
    }
  } else if (normalizedRequest.state) {
    params.set("state", normalizedRequest.state);
  }

  if (normalizedRequest.minimumDaysPerRange !== defaultMinimumDaysPerRange) {
    params.set("minDays", String(normalizedRequest.minimumDaysPerRange));
  }

  if (normalizedRequest.maximumDaysPerRange !== defaultMaximumDaysPerRange) {
    params.set("maxDays", String(normalizedRequest.maximumDaysPerRange));
  }

  const customDayDates = uniqueDates((normalizedRequest.customFreeDays ?? []).map((day) => day.date));
  if (customDayDates.length > 0) {
    params.set("customDays", customDayDates.join(","));
  }

  const ignoredHolidayDates = uniqueDates(normalizedRequest.ignoredHolidayDates ?? []);
  if (ignoredHolidayDates.length > 0) {
    params.set("ignoredHolidays", ignoredHolidayDates.join(","));
  }

  return params;
}

function getScopeCode(request: OptimizeRequest) {
  if (isIndiaOptimizeRequest(request)) {
    return request.stateCode;
  }

  if (isSpainOptimizeRequest(request)) {
    return request.cityCode ?? request.stateCode ?? "";
  }

  return request.state ?? "";
}

export function requestsMatch(left: OptimizeRequest | null, right: OptimizeRequest | null) {
  if (!left || !right) {
    return false;
  }

  const normalizedLeft = normalizeOptimizeRequest(left);
  const normalizedRight = normalizeOptimizeRequest(right);

  return normalizedLeft.country === normalizedRight.country
    && getScopeCode(normalizedLeft) === getScopeCode(normalizedRight)
    && normalizedLeft.year === normalizedRight.year
    && normalizedLeft.vacationDays === normalizedRight.vacationDays
    && normalizedLeft.minimumDaysPerRange === normalizedRight.minimumDaysPerRange
    && normalizedLeft.maximumDaysPerRange === normalizedRight.maximumDaysPerRange
    && uniqueDates((normalizedLeft.customFreeDays ?? []).map((day) => day.date)).join(",")
      === uniqueDates((normalizedRight.customFreeDays ?? []).map((day) => day.date)).join(",")
    && uniqueDates(normalizedLeft.ignoredHolidayDates ?? []).join(",")
      === uniqueDates(normalizedRight.ignoredHolidayDates ?? []).join(",");
}

export function hasSameHolidayScope(left: OptimizeRequest | null, right: OptimizeRequest) {
  const normalizedRight = normalizeOptimizeRequest(right);
  const normalizedLeft = left ? normalizeOptimizeRequest(left) : null;

  return normalizedLeft?.country === normalizedRight.country
    && normalizedLeft?.year === normalizedRight.year
    && (normalizedLeft ? getScopeCode(normalizedLeft) : "") === getScopeCode(normalizedRight);
}

export function withIgnoredHolidayDates(request: OptimizeRequest, ignoredHolidayDates: string[]) {
  return normalizeOptimizeRequest({
    ...request,
    ignoredHolidayDates: ignoredHolidayDates.length > 0 ? ignoredHolidayDates : undefined,
  });
}
