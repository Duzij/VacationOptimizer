export default function Legend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
            <LegendItem color="bg-vacation" label="Vacation" tooltip="Suggested vacation date" />
            <LegendItem color="bg-vacation" label="Locked Vacation" tooltip="Vacation date that does not change between shuffles" locked />
            <LegendItem color="bg-custom" label="Custom Free Day" tooltip="Vacation date that does not consume your budget, but is included in the algorithm (e.g. birthday)" />
            <LegendItem color="bg-holiday" label="Public Holiday" tooltip="Vacation day for everyone" />
            <LegendItem color="bg-weekend" label="Weekend" tooltip="Weekend" />
            <LegendItem color="bg-never-holiday" label="Never Vacation" tooltip="Day excluded from the algorithm" />
            <LegendItem color="bg-surface" label="Work Day" tooltip="Work day" />
        </div>
    );
}

function LegendItem({ color, label, tooltip, locked = false }: { color: string; label: string; tooltip?: string; locked?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 cursor-help" title={tooltip}>
            <div className={`w-2.5 h-2.5 rounded-sm ${color} border border-border relative`}>
                {locked && <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-current" />}
            </div>
            <span>{label}</span>
        </div>
    );
}
