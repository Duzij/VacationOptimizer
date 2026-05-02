import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface IndiaOptimizeScope {
    type: "state";
    stateCode: string;
    stateName: string;
}

export interface IndiaOptimizeResult extends OptimizationResultBase {
    countryCode: "IN";
    scope: IndiaOptimizeScope;
}

export interface IndiaOptimizeRequest extends SharedOptimizeRequestFields {
    country: "IN";
    stateCode: string;
    state?: never;
    cityCode?: never;
}

export interface IndiaCountrySchema {
    countryCode: "IN";
    component: "india";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    stateSelectionRequired: true;
    states: StateOption[];
}
