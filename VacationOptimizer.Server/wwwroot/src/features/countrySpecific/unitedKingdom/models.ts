import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface UnitedKingdomOptimizeScope {
    type: "nation";
    nationCode: string;
    nationName: string;
}

export interface UnitedKingdomOptimizeResult extends OptimizationResultBase {
    countryCode: "GB";
    scope: UnitedKingdomOptimizeScope;
}

export interface UnitedKingdomOptimizeRequest extends SharedOptimizeRequestFields {
    country: "GB";
    nationCode: string;
    state?: never;
    stateCode?: never;
    cityCode?: never;
    provinceCode?: never;
    cantonCode?: never;
}

export interface UnitedKingdomCountrySchema {
    countryCode: "GB";
    component: "unitedKingdom";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    nationSelectionRequired: true;
    nations: StateOption[];
}
