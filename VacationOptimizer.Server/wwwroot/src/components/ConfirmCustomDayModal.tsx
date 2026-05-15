import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import CheckboxField from "./CheckboxField";

const MONTH_NAMES_FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface Props {
    date: string;
    mode: "add" | "remove" | "removeNeverHoliday" | "reportHoliday";
    holidayName?: string | null;
    onConfirmCustomDay: () => void;
    onConfirmNeverHoliday: () => void;
    onIgnoreHoliday?: (reportAsIncorrect: boolean) => Promise<void> | void;
    onCancel: () => void;
}

export default function ConfirmCustomDayModal({
    date,
    mode,
    holidayName,
    onConfirmCustomDay,
    onConfirmNeverHoliday,
    onIgnoreHoliday,
    onCancel,
}: Props) {
    const [_year, month, day] = date.split("-").map(Number);
    const monthName = MONTH_NAMES_FULL[month - 1];
    const isRemove = mode === "remove";
    const isRemoveNeverHoliday = mode === "removeNeverHoliday";
    const isHolidayReport = mode === "reportHoliday";
    const [reportAsIncorrect, setReportAsIncorrect] = useState(false);
    const [isSubmittingIgnore, setIsSubmittingIgnore] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    useEffect(() => {
        if (!isHolidayReport) {
            return;
        }

        setReportAsIncorrect(false);
        setIsSubmittingIgnore(false);
    }, [date, isHolidayReport]);

    const handleIgnoreHoliday = async () => {
        if (!onIgnoreHoliday || isSubmittingIgnore) {
            return;
        }

        setIsSubmittingIgnore(true);
        try {
            await onIgnoreHoliday(reportAsIncorrect);
        } finally {
            setIsSubmittingIgnore(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text">
                        {isHolidayReport
                            ? "Report public holiday"
                            : isRemoveNeverHoliday ? "Remove never a holiday"
                            : isRemove ? "Remove custom vacation day" : "Add custom vacation day"}
                    </h2>
                    {!isHolidayReport && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-sm text-text">
                    {isHolidayReport
                        ? <>Ignore <span className="font-semibold text-text">{holidayName ?? "this public holiday"}</span> on <span className="font-semibold text-text">{monthName} {day}</span> so it no longer affects your plan.</>
                        : isRemoveNeverHoliday
                        ? <>Do you want to let day <span className="font-semibold text-text">{day}</span> of <span className="font-semibold text-text">{monthName}</span> be considered for vacation ranges again?</>
                        : isRemove
                        ? <>Do you want to remove day <span className="font-semibold text-text">{day}</span> of <span className="font-semibold text-text">{monthName}</span> from custom vacation days?</>
                        : <>How do you want to mark day <span className="font-semibold text-text">{day}</span> of <span className="font-semibold text-text">{monthName}</span>?</>
                    }
                </p>

                {isHolidayReport ? (
                    <>
                        <CheckboxField
                            checked={reportAsIncorrect}
                            onChange={setReportAsIncorrect}
                            label="Report this holiday as incorrect"
                        />

                        <div className="flex gap-3 flex-wrap">
                            <Button type="button" onClick={onCancel} variant="secondary" className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={onConfirmNeverHoliday}
                                variant="secondary"
                                className="flex-1"
                            >
                                Never a holiday
                            </Button>
                            <Button
                                type="button"
                                onClick={handleIgnoreHoliday}
                                disabled={isSubmittingIgnore}
                                className="flex-1"
                            >
                                {isSubmittingIgnore ? "Ignoring..." : "Ignore"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-3 flex-wrap">
                        <Button type="button" onClick={onCancel} variant="secondary" className="flex-1">
                            Cancel
                        </Button>
                        {mode === "add" ? (
                            <>
                                <Button
                                    type="button"
                                    onClick={onConfirmNeverHoliday}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Never a holiday
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onConfirmCustomDay}
                                    className="flex-1"
                                >
                                    Custom vacation
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={isRemoveNeverHoliday ? onConfirmNeverHoliday : onConfirmCustomDay}
                                variant="danger"
                                className="flex-1"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
