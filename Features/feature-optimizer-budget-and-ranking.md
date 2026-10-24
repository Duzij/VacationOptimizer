# Feature: Full-budget optimization and best-first results

## Problem

The optimizer can leave vacation days unused when the remaining budget is smaller than a whole work segment or when a monthly cap rejects a multi-day candidate. It also returns shuffled alternatives in generation order, so the best result is not necessarily shown first. The default four-day minimum range prevents the optimizer from suggesting a simple three-day weekend break.

## Behavior

- Use the full requested vacation budget whenever enough eligible workdays can be allocated without violating active constraints.
- Generate partial and single-workday candidates in addition to whole work segments. Prefer placements that create the most days off, including Monday/Friday placements that form three-day weekend ranges.
- Treat monthly caps, protected days, locked days, and explicitly configured minimum/maximum range lengths as hard constraints. If they make full budget use impossible, prefer the feasible result that produces the most days off and then uses the most vacation days.
- Rank generated alternatives by `TotalDaysOff` descending and then `VacationDaysUsed` descending, with deterministic tie-breaking. Assign result-token attempts after ranking so replay and shuffle history remain consistent.
- Relax new-planner defaults to a 3–21 day range. Existing explicitly saved or shared range constraints keep their meaning.
- Preserve unique-output filtering, signed result tokens, matching planner seeds, locked days, and country-specific endpoint behavior.

## Acceptance checks

- A feasible budget is used exactly, including budgets that require splitting a work segment or placing a single day beside a weekend.
- Monthly caps do not cause avoidable unused budget and are never exceeded.
- Every generated alternative follows the same budget and constraint rules.
- The first returned result has the highest `TotalDaysOff`; ties use more vacation days first. Subsequent shuffles follow the ranked order and seed tokens replay the same result.
- Explicit range limits are respected, while the default planner can suggest three-day ranges.
- Server, frontend, and production build validation pass.
