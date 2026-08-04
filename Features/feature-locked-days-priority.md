# Feature: Locked vacation days take priority over monthly caps

## Problem

Monthly vacation caps let users protect days in specific months, but a cap set after locking days can conflict with those locks. When the planner loads a saved or shared configuration where a month cap is lower than the number of locked vacation days in that month, the optimizer rejects the request. Previously this was handled by showing a stale saved calendar, but that created a non-interactive dead end with two calendar components. The right behavior is to treat locked days as the user's explicit intent and adjust the cap to match.

## Behavior

- When the planner restores its initial request on load, it inspects every month that has locked vacation days.
- If a month's cap is missing or lower than the count of locked days in that month, the cap is automatically raised to that count.
- The adjusted request is used for the automatic restore optimization, reflected in the active form state, and written to the URL so the corrected configuration can be shared or refreshed.
- No special fallback calendar is rendered: the planner either succeeds and shows the current result calendar, or fails for an unrelated reason and shows the normal error messaging.
- The adjustment only happens on load. A user can still manually create a conflicting configuration later and will see the usual validation error, which encourages them to lower locks or raise caps intentionally.

## Acceptance checks

- A restored request with two locked July days and a July cap of 1 loads successfully with the cap raised to 2.
- The URL is updated to the adjusted cap.
- A restored request whose caps already fit locked days is unchanged.
- The planner renders only one `CalendarView`.
