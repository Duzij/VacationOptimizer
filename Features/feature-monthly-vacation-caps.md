# Feature: Monthly vacation-day caps

## Problem

The optimization request already contained `MaxNumberOfVacationsPerMonth`, and the server included it in result-token fingerprints, but no client could set it and the optimizer never enforced it. This made a dormant contract field misleading and prevented a common planning constraint: reserving vacation days for other months.

## Behavior

- In **Advanced constraints**, users manually add the months they want to cap via an **Add a month…** selector. Each added month starts at `0` (no cap) and can be increased with `+` / `-` buttons or by typing the value directly. Only values greater than `0` are stored as active caps, and a month can be removed entirely.
- In the **calendar view**, every month header has a cap icon in the upper-right corner. If a cap is active, its value is shown next to the icon. Clicking the icon opens the same details-lip component used for day details and prompts the user to set a max limit for that month.
- The selection is carried in local persistence, optimized-request comparisons, and shareable planner URLs as `monthlyCaps=month:limit` pairs, for example `1:2,7:3`. Months left at `0` are omitted.
- The server validates each cap as an integer from 0 through 31, includes it in the signed-result request fingerprint, and rejects a request when its locked vacation days already exceed a configured cap.
- During optimization, a bridge candidate is skipped if selecting it would exceed a configured month cap. Caps apply to every country-specific optimization path because those paths reuse `VacationOptimizerService`.

## Acceptance checks

- A cap above `0` limits optimizer-selected vacation days in that month.
- Locked vacation days cannot silently exceed a cap.
- Setting a cap back to `0` removes the cap and resets incompatible shuffle history, producing a distinct signed result token.
- Changing a cap resets incompatible shuffle history and produces a distinct signed result token.
- Caps survive a browser refresh and a planner URL round trip.
