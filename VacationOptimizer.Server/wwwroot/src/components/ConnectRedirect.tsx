import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { markConnectRedirected, persistConnectedCalendar } from "../utils/optimizationPersistence";

export default function ConnectRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token")?.trim() ?? "";
    const connectedCalendarName = searchParams.get("connectedCalendarName")?.trim() ?? "";
    const connectedCalendarYear = searchParams.get("connectedCalendarYear")?.trim() ?? "";

    if (token) {
      // persist token, optional display name, and optional year
      persistConnectedCalendar(token, connectedCalendarName, connectedCalendarYear || null);
      markConnectRedirected();
    }

    navigate("/app", { replace: true, state: { fromConnect: true } });
  }, [navigate, searchParams]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface/60 px-5 py-4 text-sm text-text-muted">
      Connecting your shared calendar...
    </div>
  );
}
