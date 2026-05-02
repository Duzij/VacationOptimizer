import { useEffect, useState } from "react";
import {
  DayType,
  type CalendarDay,
  type CustomFreeDay,
  type OptimizeRequest,
  type OptimizeResult,
} from "../types/models";
import {
  getOptimizeRequestScopeCode,
  isIndiaOptimizeRequest,
} from "../features/countrySpecific/models";

export interface FeedbackDraft {
  title: string;
  description?: string;
  message: string;
  submitLabel?: string;
}

export interface ConfirmDayState {
  date: string;
  mode: "add" | "remove" | "reportHoliday";
  holidayName?: string | null;
}

function formatReportDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function submitHolidayReport(message: string) {
  const data = new FormData();
  data.append("message", message);

  const response = await fetch("https://formspree.io/f/xvzblown", {
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to submit holiday report.");
  }
}

export function useCalendarInteractions({
  activeRequest,
  result,
  ignoredHolidayDates,
  setIgnoredHolidayDates,
  customFreeDays,
  setCustomFreeDays,
  runOptimization,
}: {
  activeRequest: OptimizeRequest | null;
  result: OptimizeResult | null;
  ignoredHolidayDates: string[];
  setIgnoredHolidayDates: React.Dispatch<React.SetStateAction<string[]>>;
  customFreeDays: CustomFreeDay[];
  setCustomFreeDays: React.Dispatch<React.SetStateAction<CustomFreeDay[]>>;
  runOptimization: (
    req: OptimizeRequest,
    overrideIgnoredHolidayDates?: string[],
    options?: { showLoading?: boolean },
  ) => Promise<unknown>;
}) {
  const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft | null>(null);
  const [confirmDay, setConfirmDay] = useState<ConfirmDayState | null>(null);

  useEffect(() => {
    if (!feedbackDraft) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFeedbackDraft(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedbackDraft]);

  const createHolidayReportMessage = (day: CalendarDay, isIgnoredInApp = ignoredHolidayDates.includes(day.date)) => {
    const country = activeRequest?.country ?? "unknown";
    const scopeCode = getOptimizeRequestScopeCode(activeRequest);
    const state = isIndiaOptimizeRequest(activeRequest)
      ? (scopeCode || "required state not selected")
      : (scopeCode || "national");
    return [
      "Issue type: Public holiday removal request",
      `Ignored in app: ${isIgnoredInApp ? "yes" : "no"}`,
      `Country: ${country}`,
      `State: ${state}`,
      `Date: ${formatReportDate(day.date)} (${day.date})`,
      `Holiday name: ${day.holidayName ?? "Unknown"}`,
      "",
      "Why this holiday should be removed:",
    ].join("\n");
  };

  const handleDayLongPress = (day: CalendarDay) => {
    if (day.type === DayType.PassedDay) {
      return;
    }

    if (day.type === DayType.PublicHoliday) {
      setConfirmDay({ date: day.date, mode: "reportHoliday", holidayName: day.holidayName });
      return;
    }

    const isExisting = customFreeDays.some((item) => item.date === day.date);
    setConfirmDay({ date: day.date, mode: isExisting ? "remove" : "add" });
  };

  const handleConfirmCustomDay = () => {
    if (!confirmDay || !activeRequest) {
      return;
    }

    if (confirmDay.mode === "reportHoliday") {
      setConfirmDay(null);
      return;
    }

    const updatedDays = confirmDay.mode === "remove"
      ? customFreeDays.filter((day) => day.date !== confirmDay.date)
      : [...customFreeDays, { date: confirmDay.date, title: "" }];

    setCustomFreeDays(updatedDays);
    setConfirmDay(null);

    const updatedRequest: OptimizeRequest = {
      ...activeRequest,
      customFreeDays: updatedDays.length > 0 ? updatedDays : undefined,
    };

    void runOptimization(updatedRequest);
  };

  const handleIgnoreHoliday = async (reportAsIncorrect: boolean) => {
    if (!confirmDay || !activeRequest || confirmDay.mode !== "reportHoliday") {
      return;
    }

    const holidayDay = result?.calendar.days.find((day) => day.date === confirmDay.date);
    if (!holidayDay) {
      setConfirmDay(null);
      return;
    }

    const updatedIgnoredHolidayDates = ignoredHolidayDates.includes(confirmDay.date)
      ? ignoredHolidayDates
      : [...ignoredHolidayDates, confirmDay.date];

    if (reportAsIncorrect) {
      try {
        await submitHolidayReport(createHolidayReportMessage(holidayDay, true));
      } catch (error) {
        console.error(error);
      }
    }

    setIgnoredHolidayDates(updatedIgnoredHolidayDates);
    setConfirmDay(null);
    void runOptimization(activeRequest, updatedIgnoredHolidayDates);
  };

  return {
    feedbackDraft,
    setFeedbackDraft,
    confirmDay,
    setConfirmDay,
    handleDayLongPress,
    handleConfirmCustomDay,
    handleIgnoreHoliday,
  };
}
