import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Clipboard, X } from "lucide-react";
import Button from "./Button";

interface Props {
  plannerSeed?: string | null;
  plannerYear: number;
  initialCalendarName: string;
  onClose: () => void;
  onCalendarNameSave: (name: string) => void;
}

const calendarNamePattern = /^[A-Za-z]{1,32}$/;

function getOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

function normalizePlannerSeed(plannerSeed?: string | null) {
  if (typeof plannerSeed !== "string") {
    return "";
  }

  const trimmedPlannerSeed = plannerSeed.trim();
  if (!trimmedPlannerSeed || trimmedPlannerSeed.toLowerCase() === "undefined") {
    return "";
  }

  return trimmedPlannerSeed;
}

export default function ShareCalendarModal({
  plannerSeed,
  plannerYear,
  initialCalendarName,
  onClose,
  onCalendarNameSave,
}: Props) {
  const [calendarName, setCalendarName] = useState(initialCalendarName);
  const [copiedField, setCopiedField] = useState<"connect" | null>(null);
  const trimmedCalendarName = calendarName.trim();
  const normalizedPlannerSeed = normalizePlannerSeed(plannerSeed);
  const isValidCalendarName = calendarNamePattern.test(trimmedCalendarName);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isValidCalendarName) {
      onCalendarNameSave(trimmedCalendarName);
    }
  }, [isValidCalendarName, onCalendarNameSave, trimmedCalendarName]);

  const connectLink = useMemo(() => {
    if (!isValidCalendarName || !normalizedPlannerSeed) {
      return "";
    }

    const params = new URLSearchParams({
      token: normalizedPlannerSeed,
      connectedCalendarName: trimmedCalendarName,
      connectedCalendarYear: String(plannerYear),
    });

    return `${getOrigin()}/connect?${params.toString()}`;
  }, [isValidCalendarName, normalizedPlannerSeed, trimmedCalendarName, plannerYear]);

  const handleCopy = useCallback(async (value: string, field: "connect") => {
    if (!value) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1600);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-text">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="calendar-name" className="block text-sm font-medium text-text">
              Calendar name
            </label>
            <input
              id="calendar-name"
              type="text"
              maxLength={32}
              value={calendarName}
              onChange={(event) => setCalendarName(event.target.value.replace(/[^A-Za-z]/g, ""))}
              placeholder="Friends"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <p className="text-xs text-text-muted">Letters only, up to 32 characters.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">Share link</label>
            <code className="block break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-[11px] leading-5 text-text-muted">
              {connectLink || (normalizedPlannerSeed
                ? "Enter a valid calendar name to generate the link."
                : "Share link unavailable until this calendar has a valid share token.")}
            </code>
            <Button
              type="button"
              variant="secondary"
              disabled={!connectLink}
              onClick={() => void handleCopy(connectLink, "connect")}
            >
              {copiedField === "connect" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copiedField === "connect" ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
