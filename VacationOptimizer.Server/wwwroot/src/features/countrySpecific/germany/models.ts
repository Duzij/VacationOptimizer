import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface GermanyOptimizeScope {
    type: "state";
    stateCode: string;
    stateName: string;
}

export interface GermanyOptimizeResult extends OptimizationResultBase {
    countryCode: "DE";
    scope: GermanyOptimizeScope;
}

export interface GermanyOptimizeRequest extends SharedOptimizeRequestFields {
    country: "DE";
    stateCode: string;
    state?: never;
    cityCode?: never;
}

export interface GermanyCountrySchema {
    countryCode: "DE";
    component: "germany";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    stateSelectionRequired: true;
    states: StateOption[];
}
