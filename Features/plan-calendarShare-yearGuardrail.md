## Plan: Calendar Connect Year Guardrail

TL;DR
Allow users to connect to the same calendar token, but reject only when the shared connect link is for a different year. Persist the incoming `connectedToken` even when the year mismatch prevents immediate connection so the user can change the year without needing to click the link again.

Steps
1. Connect query args
   - Add `connectedCalendarYear` to the `/connect` redirect flow.
   - Keep `token` and `connectedCalendarName` behavior unchanged.
   - The new query string should be: `/connect?token=<shareToken>&connectedCalendarName=<name>&connectedCalendarYear=<year>`.

2. Persistence and redirect
   - In `ConnectRedirect.tsx`, read `token`, `connectedCalendarName`, and `connectedCalendarYear` from query params.
   - Persist all three values through `optimizationPersistence`.
   - Redirect to `/app` after persisting.

3. App state
   - Add `connectedCalendarYear` state in `App.tsx` alongside `connectedToken` and `connectedCalendarName`.
   - Keep `connectedToken` persisted even if the link fails due to year mismatch.
   - If year mismatch occurs, show a dedicated warning and do not disconnect the token.
   - If the user later changes the planner year to match `connectedCalendarYear`, the connection can apply without re-clicking the link.

4. Failure handling
   - Remove the same-calendar refusal based solely on matching token payload.
   - Add a year-mismatch warning:
     - "This connect link is for a different year and was not applied. Change the planner year to match the shared calendar, or ask the sender for a new link."
   - Keep the persisted `connectedToken` and metadata so the user does not lose the pending connect state.
   - If the token is invalid or missing, clear connection state normally.

5. Share modal
   - Include `connectedCalendarYear` in the generated connect link.
   - Ensure the primary modal flow still creates share links with:
     - `token`
     - `connectedCalendarName`
     - `connectedCalendarYear`
   - Keep existing copy: share token remains the calendar seed, connect link lets someone connect without cloning.

6. Tests
   - Add route/component tests for `/connect` with `connectedCalendarYear`.
   - Test that the new year param is persisted and included in `/app` URL.
   - Test that a year mismatch shows the new warning.
   - Test that the token remains persisted across the mismatch failure.
   - Test that changing the planner year later should allow connection without needing the user to reclick the link.

Relevant files
- `App.tsx`
- `PlannerSeed.tsx`
- `ConnectRedirect.tsx`
- `ShareCalendarModal.tsx`
- `optimizationPersistence.ts`
- `CalendarSeed.cs`
- `App.test.tsx`

Notes
- This is a follow-up to the calendar connect flow.
- The new guardrail is year-specific, not token-specific.
- The UX should preserve the connection intent and avoid forcing users to re-open the shared link.
