# Feature: Custom planning period

## Goal

Let people optimize any continuous planning period instead of being limited to a fixed January–December year. The planner should accept a custom start date and end date, normalize them to full-month boundaries on the server, and support periods up to several calendar years when needed.

## Period rules

- In the default mode, the period is January 1 through December 31 of the selected year.
- Selecting **Edit** reveals **Start date** and **End date** controls.
- The controls are native date pickers. The selected day is retained for a familiar UX, but the server normalizes the period to month boundaries:
  - The planning period starts on the first day of the start month.
  - The planning period ends on the last day of the end month.
- The selected year of each date picker is retained. A January 2026 start and January 2027 end therefore creates a period from January 1, 2026 through January 31, 2027.
- The frontend enforces that the end date must be strictly after the start date.
- Resetting the period returns to the standard January–December year.

## UI and request mapping

`SharedDraft` stores `startDate` and `endDate` as raw date strings. The frontend sends them unchanged in the API request:

| Selection | Request value (raw) | Server-normalized period |
| --- | --- | --- |
| Start May 12, 2026, end April 20, 2027 | `startDate: "2026-05-12"`, `endDate: "2027-04-20"` | May 1, 2026 – April 30, 2027 |
| Start October 15, 2026, end March 20, 2027 | `startDate: "2026-10-15"`, `endDate: "2027-03-20"` | October 1, 2026 – March 31, 2027 |

The server normalizes `startDate` to the first day of its month and `endDate` to the last day of its month before building the calendar. Existing API clients may continue to send explicit boundary dates if they prefer.

## Persistence

- Custom `startDate` and `endDate` are persisted via `optimizationRequest.ts` normalizers and included in URL search params.
- `requestsMatch` treats requests with different custom periods as different requests.

## Validation

- Server-side `ValidateCustomPeriodDates` rejects either date being provided without the other.
- Server-side validation rejects an end date that is on or before the start date (`endDate <= startDate`).
- Frontend `isValidCustomPeriod` disables the Optimize button and shows an inline error until `startDate < endDate`.

## Acceptance checks

- Edit mode displays accessible start- and end-date controls.
- Choosing a May start date prefills an April end date in the following year.
- A period from October 15, 2026 through March 20, 2027 is submitted as those raw dates and normalized to October 1, 2026 through March 31, 2027 by the server.
- Submitting an optimization preserves the custom period on restore, URL, and localStorage so the UI does not reset to a plain year.
- Reset restores the standard selected calendar year.
- Server rejects `startDate == endDate` and `endDate < startDate`.
