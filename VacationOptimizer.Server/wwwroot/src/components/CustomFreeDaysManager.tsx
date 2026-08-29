import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { CustomFreeDay } from "../types/models";
import Button from "./Button";
import posthog from "../posthog";

interface Props {
    customFreeDays: CustomFreeDay[];
    onUpdate: (days: CustomFreeDay[]) => void;
}

export default function CustomFreeDaysManager({ customFreeDays, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState("");
    const [title, setTitle] = useState("");

    const handleAdd = () => {
        if (!date) return;

        const newDay: CustomFreeDay = {
            date,
            title: title || undefined,
        };

        posthog.capture("custom_free_day_added");
        onUpdate([...customFreeDays, newDay]);
        setDate("");
        setTitle("");
    };

    const handleRemove = (index: number) => {
        posthog.capture("custom_free_day_removed");
        onUpdate(customFreeDays.filter((_, i) => i !== index));
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
        );
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Custom Free Days (birthdays, etc.)
            </button>

            {isOpen && (
                <div className="space-y-3 p-3 rounded-lg bg-surface/50 border border-border">
                    <div className="space-y-2">
                        <label htmlFor="customDate" className="text-xs font-medium text-text-muted">
                            Date
                        </label>
                        <input
                            id="customDate"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-surface border border-border text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="customTitle" className="text-xs font-medium text-text-muted">
                            Title (optional)
                        </label>
                        <input
                            id="customTitle"
                            type="text"
                            placeholder="e.g., Birthday, Anniversary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md bg-surface border border-border text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={handleAdd}
                        disabled={!date}
                        fullWidth
                    >
                        Add Day
                    </Button>
                </div>
            )}

            {customFreeDays.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-text-muted font-medium">Custom free days ({customFreeDays.length})</p>
                    <div className="space-y-1">
                        {customFreeDays.map((day, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-md bg-custom/20 border border-custom/30"
                            >
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-custom-text">{formatDate(day.date)}</p>
                                    {day.title && <p className="text-xs text-text-muted">{day.title}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    className="p-1 text-text-muted hover:text-accent transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
