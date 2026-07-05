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

      <div className={`grid shrink-0 items-center gap-2 ${isConnected ? "grid-cols-2" : "grid-cols-1"} sm:flex sm:flex-wrap`}>
        <button
          type="button"
          onClick={onOpenShareModal}
          disabled={!canShare}
          className="action-btn action-btn-secondary w-full justify-center sm:ml-auto sm:w-auto"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        {isConnected && (
          <button
            type="button"
            onClick={onDisconnect}
            className="action-btn action-btn-secondary w-full justify-center sm:ml-auto sm:w-auto"
          >
            <Unplug className="h-4 w-4" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
