## Plan: Calendar Share and Connect Flow

TL;DR
Keep share tokens as the existing calendar seed. Add a single `/connect` flow for foreign calendar connections and reuse the share modal inside the main app component. Keep calendar names separate from tokens and use `connectedCalendarName` only in `/connect`.

Steps
1. App routing and state
   - Add `calendarName` and `connectedToken` state in `App.tsx`.
   - Remove `shareToken` and `connectedName` usage.
   - Add a route for `/connect` only.
   - Show a connected-calendar banner in `/app` when `connectedToken` exists.
   - Support disconnecting `connectedToken` and clearing the URL param.

2. `/connect` redirect
   - Add `ConnectRedirect.tsx`.
   - Read `token` and `connectedCalendarName` from query, persist both, and redirect to `/app`.
   - Use the name only for UI display.

3. Persistence helpers
   - Extend `optimizationPersistence.ts`.
   - Save `calendarName` for the share modal.
   - Save `connectedToken` and `connectedCalendarName` while connected, clear on disconnect.
   - Update `/app` URL after redirect with `connectedToken` and `connectedCalendarName`.

4. Share modal
   - Add `ShareCalendarModal.tsx`.
   - Prompt for a letters-only calendar name, max 32 chars.
   - Show two links after validation:
     - `/connect?token=<shareToken>&connectedCalendarName=<name>`
     - The primary sharing experience remains within the app as a modal, not a separate route.
   - Clarify:
     - Share copy keeps the existing token format.
     - Connect link lets someone connect their planner to your calendar without cloning it.
   - Add these prompts:
     - "Name your calendar so friends can connect to it more easily."
     - "This calendar connect link lets someone connect their planner to your calendar without cloning it."
     - "If you already named your calendar, we will reuse that name in future share flows."

5. First-time warning
   - If `/connect` redirects to `/app` and no planner state exists, show:
     "Looks like it’s your first time using a website. You can start by building your own calendar or ask a friend to share a connect link."
   - If `connectedToken` exists but no local planner state exists, show a warning and do not activate the connection.

6. Same-calendar warning
   - Compare foreign `connectedToken` payload only, ignoring metadata name values.
   - If `connectedToken` payload matches current `plannerSeed`, show a warning and refuse to connect.

7. PlannerSeed updates
   - Extend PlannerSeed props for share modal, connected name display, and disconnect.
   - Show "Connected to XXX" when `connectedToken` exists.
   - Add a share button near seed copy.

8. Tests
   - Add route/component tests for `/connect`.
   - Test connect token redirect and persistence.
   - Test saved calendar name reuse.
   - Test that `connectedToken` is added to URL after redirect and cleared on disconnect.
   - Test that different names with the same seed payload are treated as the same calendar.
   - Test first-time and same-calendar warnings.

Relevant files
- `App.tsx`
- `PlannerSeed.tsx`
- `ConnectRedirect.tsx`
- `ShareCalendarModal.tsx`
- `optimizationPersistence.ts`
- `CalendarSeed.cs`
- `App.test.tsx`

Test cases
1. `/connect?token=<shareToken>&connectedCalendarName=<name>` redirects to `/app` and persists the token.
2. The share modal saves and reuses the calendar name.
3. The modal shows a calendar connect link.
4. `connectedToken` is added to `/app` URL after redirect and cleared on disconnect.
5. Different names with the same seed payload are treated as the same calendar.
6. The app shows "Connected to XXX" when connected.
7. A first-time `/connect` redirect without planner state shows the onboarding warning.
8. A `connectedToken` matching the current seed payload shows a same-calendar warning.
9. A `connectedToken` without planner state shows a foreign-calendar warning.
10. Disconnecting clears connected state and URL param.
