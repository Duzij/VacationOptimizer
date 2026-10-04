const fs = require('fs');
const file = './VacationOptimizer.Server/wwwroot/src/features/countrySpecific/shared/optimizerFormShared.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    const currentYear = getDefaultYear();
    const minimumYear = yearMin ?? currentYear;
    const maximumYear = yearMax ?? currentYear + 5;
    const monthlyVacationLimits = sharedDraft.maxNumberOfVacationsPerMonth ?? {};

    const [isCustomPeriod, setIsCustomPeriod] = useState(!!(sharedDraft.startDate || sharedDraft.endDate));

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const start = e.target.value;
        onSharedDraftChange((draft) => {
            if (!start) return { ...draft, startDate: start };
            const startDateObj = new Date(start);
            const defaultEndDateObj = new Date(startDateObj);
            defaultEndDateObj.setFullYear(defaultEndDateObj.getFullYear() + 1);
            defaultEndDateObj.setDate(defaultEndDateObj.getDate() - 1);
            const defaultEndDate = defaultEndDateObj.toISOString().split('T')[0];
            return {
                ...draft,
                startDate: start,
                endDate: draft.endDate || defaultEndDate
            };
        });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const end = e.target.value;
        onSharedDraftChange((draft) => ({ ...draft, endDate: end }));
    };

    const toggleCustomPeriod = () => {
        if (isCustomPeriod) {
            setIsCustomPeriod(false);
            onSharedDraftChange((draft) => ({ ...draft, startDate: undefined, endDate: undefined }));
        } else {
            setIsCustomPeriod(true);
            const start = \`\${sharedDraft.year}-01-01\`;
            const end = \`\${sharedDraft.year}-12-31\`;
            onSharedDraftChange((draft) => ({ ...draft, startDate: start, endDate: end }));
        }
    };

    const isDurationValid = () => {
        if (!sharedDraft.startDate || !sharedDraft.endDate) return true;
        const start = new Date(sharedDraft.startDate);
        const end = new Date(sharedDraft.endDate);
        if (end < start) return false;
        const maxEnd = new Date(start);
        maxEnd.setFullYear(maxEnd.getFullYear() + 1);
        maxEnd.setDate(maxEnd.getDate() - 1);
        return end <= maxEnd;
    };

    return (
        <>
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label htmlFor="year" className="text-sm font-medium text-text-muted">
                        {isCustomPeriod ? "Custom Period" : "Year"}
                    </label>
                    <button type="button" onClick={toggleCustomPeriod} className="text-xs text-primary hover:underline font-medium">
                        {isCustomPeriod ? "Reset to Year" : "Edit"}
                    </button>
                </div>
                {!isCustomPeriod ? (
                    <div className="flex items-center w-full rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                        <input
                            id="year"
                            type="number"
                            min={minimumYear}
                            max={maximumYear}
                            value={sharedDraft.year}
                            onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, year: Number(e.target.value) }))}
                            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <div className="flex flex-col h-full">
                            <button
                                type="button"
                                onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.min(draft.year + 1, maximumYear) }))}
                                className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                                aria-label="Increment year"
                            >
                                <ChevronUp className="w-3 h-3" />
                            </button>
                            <div className="h-px bg-border" />
                            <button
                                type="button"
                                onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.max(draft.year - 1, minimumYear) }))}
                                className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                                aria-label="Decrement year"
                            >
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={sharedDraft.startDate || ""}
                                onChange={handleStartDateChange}
                                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            <span className="text-text-muted text-sm">to</span>
                            <input
                                type="date"
                                value={sharedDraft.endDate || ""}
                                onChange={handleEndDateChange}
                                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>
                        {!isDurationValid() && (
                            <p className="text-xs text-red-500">Period must not exceed 12 months, and end date must be after start date.</p>
                        )}
                    </div>
                )}`;

const target = `    const currentYear = getDefaultYear();
    const minimumYear = yearMin ?? currentYear;
    const maximumYear = yearMax ?? currentYear + 5;
    const monthlyVacationLimits = sharedDraft.maxNumberOfVacationsPerMonth ?? {};

    return (
        <>
            <div className="space-y-1.5">
                <label htmlFor="year" className="text-sm font-medium text-text-muted">
                    Year
                </label>
                <div className="flex items-center w-full rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                    <input
                        id="year"
                        type="number"
                        min={minimumYear}
                        max={maximumYear}
                        value={sharedDraft.year}
                        onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, year: Number(e.target.value) }))}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <div className="flex flex-col h-full">
                        <button
                            type="button"
                            onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.min(draft.year + 1, maximumYear) }))}
                            className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            aria-label="Increment year"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="h-px bg-border" />
                        <button
                            type="button"
                            onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.max(draft.year - 1, minimumYear) }))}
                            className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            aria-label="Decrement year"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        </div>
                    </div>`;

// Note the </div> indentation might not match exactly, so replacing up to the last button
const regex = /const currentYear = getDefaultYear\(\);[\s\S]*?ChevronDown className="w-3 h-3" \/>\s*<\/button>\s*<\/div>\s*<\/div>/m;
content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
