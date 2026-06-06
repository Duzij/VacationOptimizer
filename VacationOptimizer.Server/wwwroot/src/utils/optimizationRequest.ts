import {
  type CustomFreeDay,
  type OptimizeRequest,
} from "../types/models";
import {
  isIndiaOptimizeRequest,
  isSpainOptimizeRequest,
  isSwitzerlandOptimizeRequest,
  type IndiaOptimizeRequest,
  type SpainOptimizeRequest,
  type SwitzerlandOptimizeRequest,
} from "../features/countrySpecific/models";
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

  const daysByDate = new Map<string, CustomFreeDay>();
  customFreeDays.forEach((day) => {
    if (!day.date) {
      return;
    }

    daysByDate.set(day.date, day);
  });

  return [...daysByDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, day]) => ({
      date,
      ...(day.title !== undefined ? { title: day.title } : {}),
    }));
}

function normalizeIgnoredHolidayDates(ignoredHolidayDates: string[] | undefined) {
  if (!ignoredHolidayDates || ignoredHolidayDates.length === 0) {
    return undefined;
  }

  return uniqueDates(ignoredHolidayDates);
}

function normalizeNeverHolidayDates(neverHolidayDates: string[] | undefined) {
  if (!neverHolidayDates || neverHolidayDates.length === 0) {
    return undefined;
  }

  return uniqueDates(neverHolidayDates);
}

function normalizeLockedVacationDates(lockedVacationDates: string[] | undefined) {
  if (!lockedVacationDates || lockedVacationDates.length === 0) {
    return undefined;
  }

  return uniqueDates(lockedVacationDates);
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
    neverHolidayDates: normalizeNeverHolidayDates(request.neverHolidayDates),
    lockedVacationDates: normalizeLockedVacationDates(request.lockedVacationDates),
    usedResultTokens: request.usedResultTokens,
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

function normalizeSwitzerlandRequest(request: SwitzerlandOptimizeRequest): SwitzerlandOptimizeRequest {
  const normalized = normalizeBaseFields(request);

  return {
    ...normalized,
    country: "CH",
    cantonCode: request.cantonCode.trim().toUpperCase(),
  };
}

export function normalizeOptimizeRequest(request: OptimizeRequest): OptimizeRequest {
  if (isIndiaOptimizeRequest(request)) {
    return normalizeIndiaRequest(request);
  }

  if (isSpainOptimizeRequest(request)) {
    return normalizeSpainRequest(request);
  }

  if (isSwitzerlandOptimizeRequest(request)) {
    return normalizeSwitzerlandRequest(request);
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
      neverHolidayDates: parseDateList(params.get("neverHolidays")),
      lockedVacationDates: parseDateList(params.get("lockedVacationDays")),
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
      neverHolidayDates: parseDateList(params.get("neverHolidays")),
      lockedVacationDates: parseDateList(params.get("lockedVacationDays")),
    });
  }

  if (country === "CH") {
    const cantonCode = params.get("cantonCode")?.trim().toUpperCase();
    if (!cantonCode) {
      return null;
    }

    return normalizeSwitzerlandRequest({
      country: "CH",
      cantonCode,
      year: parseNumber(params.get("year"), currentYear),
      vacationDays: parseNumber(params.get("vacationDays"), defaultVacationDays),
      minimumDaysPerRange: parseNumber(params.get("minDays"), defaultMinimumDaysPerRange),
      maximumDaysPerRange: parseNumber(params.get("maxDays"), defaultMaximumDaysPerRange),
      customFreeDays: parseDateList(params.get("customDays")).map((date) => ({ date })),
      ignoredHolidayDates: parseDateList(params.get("ignoredHolidays")),
      neverHolidayDates: parseDateList(params.get("neverHolidays")),
      lockedVacationDates: parseDateList(params.get("lockedVacationDays")),
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
    neverHolidayDates: parseDateList(params.get("neverHolidays")),
    lockedVacationDates: parseDateList(params.get("lockedVacationDays")),
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
  } else if (isSwitzerlandOptimizeRequest(normalizedRequest)) {
    params.set("cantonCode", normalizedRequest.cantonCode);
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

  const neverHolidayDates = uniqueDates(normalizedRequest.neverHolidayDates ?? []);
  if (neverHolidayDates.length > 0) {
    params.set("neverHolidays", neverHolidayDates.join(","));
  }

  const lockedVacationDates = uniqueDates(normalizedRequest.lockedVacationDates ?? []);
  if (lockedVacationDates.length > 0) {
    params.set("lockedVacationDays", lockedVacationDates.join(","));
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

  if (isSwitzerlandOptimizeRequest(request)) {
    return request.cantonCode;
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
    && JSON.stringify(normalizedLeft.customFreeDays ?? [])
      === JSON.stringify(normalizedRight.customFreeDays ?? [])
    && uniqueDates(normalizedLeft.ignoredHolidayDates ?? []).join(",")
      === uniqueDates(normalizedRight.ignoredHolidayDates ?? []).join(",")
    && uniqueDates(normalizedLeft.neverHolidayDates ?? []).join(",")
      === uniqueDates(normalizedRight.neverHolidayDates ?? []).join(",")
    && uniqueDates(normalizedLeft.lockedVacationDates ?? []).join(",")
      === uniqueDates(normalizedRight.lockedVacationDates ?? []).join(",");
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
