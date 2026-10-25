import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface CanadaOptimizeScope {
    type: "province";
    provinceCode: string;
    provinceName: string;
}

export interface CanadaOptimizeResult extends OptimizationResultBase {
    countryCode: "CA";
    scope: CanadaOptimizeScope;
}

export interface CanadaOptimizeRequest extends SharedOptimizeRequestFields {
    country: "CA";
    provinceCode: string;
    state?: never;
    stateCode?: never;
    cityCode?: never;
    cantonCode?: never;
}

export interface CanadaCountrySchema {
    countryCode: "CA";
    component: "canada";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    provinceSelectionRequired: true;
    provinces: StateOption[];
}
