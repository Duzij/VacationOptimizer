export default function Legend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
            <LegendItem color="bg-vacation" label="Vacation" />
            <LegendItem color="bg-custom" label="Custom Free Day" />
            <LegendItem color="bg-holiday" label="Public Holiday" />
            <LegendItem color="bg-weekend" label="Weekend" />
            <LegendItem color="bg-surface" label="Work Day" />
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${color} border border-border`} />
            <span>{label}</span>
        </div>
    );
}
