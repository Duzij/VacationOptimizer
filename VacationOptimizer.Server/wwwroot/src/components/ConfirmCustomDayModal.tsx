import { useEffect } from "react";
import { X } from "lucide-react";

const MONTH_NAMES_FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface Props {
    date: string;
    mode: "add" | "remove" | "reportHoliday";
    holidayName?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmCustomDayModal({ date, mode, holidayName, onConfirm, onCancel }: Props) {
    const [_year, month, day] = date.split("-").map(Number);
    const monthName = MONTH_NAMES_FULL[month - 1];
    const isRemove = mode === "remove";
    const isHolidayReport = mode === "reportHoliday";

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

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
                            : isRemove ? "Remove custom vacation day" : "Add custom vacation day"}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-text-muted">
                    {isHolidayReport
                        ? <>Want to report <span className="font-semibold text-text">{holidayName ?? "this public holiday"}</span> on <span className="font-semibold text-text">{monthName} {day}</span> so we can review removing it?</>
                        : isRemove
                        ? <>Do you want to remove day <span className="font-semibold text-text">{day}</span> of <span className="font-semibold text-text">{monthName}</span> from custom vacation days?</>
                        : <>Do you want to set day <span className="font-semibold text-text">{day}</span> of <span className="font-semibold text-text">{monthName}</span> as a custom vacation day?</>
                    }
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-muted
                       hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 flex items-center justify-center rounded-lg px-4 py-2.5
                       text-sm font-semibold text-white active:scale-[0.98]
                       transition-all duration-150 cursor-pointer  ${isRemove
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-primary hover:bg-primary-hover"
                            }`}
                    >
                        {isHolidayReport ? "Open report form" : isRemove ? "Remove" : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
}
