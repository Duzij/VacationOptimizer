import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface SwitzerlandOptimizeScope {
    type: "canton";
    cantonCode: string;
    cantonName: string;
}

export interface SwitzerlandOptimizeResult extends OptimizationResultBase {
    countryCode: "CH";
    scope: SwitzerlandOptimizeScope;
}

export interface SwitzerlandOptimizeRequest extends SharedOptimizeRequestFields {
    country: "CH";
    cantonCode: string;
    state?: never;
    stateCode?: never;
    cityCode?: never;
}

export interface SwitzerlandCountrySchema {
    countryCode: "CH";
    component: "switzerland";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    cantonSelectionRequired: true;
    cantons: StateOption[];
}
