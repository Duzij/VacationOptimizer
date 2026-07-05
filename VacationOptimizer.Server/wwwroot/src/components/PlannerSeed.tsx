import { Share2, Unplug } from "lucide-react";

interface Props {
  isVisible: boolean;
  connectedCalendarName?: string;
  isConnected: boolean;
  canShare?: boolean;
  onDisconnect: () => void;
  onOpenShareModal: () => void;
}

export default function PlannerSeed({
  isVisible,
  connectedCalendarName = "",
  isConnected,
  canShare = true,
  onDisconnect,
  onOpenShareModal,
}: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        {isConnected && (
          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-muted">
            Connected to {connectedCalendarName || "shared calendar"}
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenShareModal}
          disabled={!canShare}
          className="action-btn action-btn-secondary"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {isConnected && (
          <button
            type="button"
            onClick={onDisconnect}
            className="action-btn action-btn-secondary"
          >
            <Unplug className="h-4 w-4" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
