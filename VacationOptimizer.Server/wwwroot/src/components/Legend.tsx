export default function Legend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
            <LegendItem color="bg-vacation" label="Vacation" />
            <LegendItem color="bg-vacation" label="Locked Vacation" locked />
            <LegendItem color="bg-custom" label="Custom Free Day" />
            <LegendItem color="bg-holiday" label="Public Holiday" />
            <LegendItem color="bg-weekend" label="Weekend" />
            <LegendItem color="bg-never-holiday" label="Never Vacation" />
            <LegendItem color="bg-surface" label="Work Day" />
        </div>
    );
}

function LegendItem({ color, label, locked = false }: { color: string; label: string; locked?: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${color} border border-border relative`}>
                {locked && <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-current" />}
            </div>
            <span>{label}</span>
        </div>
    );
}
