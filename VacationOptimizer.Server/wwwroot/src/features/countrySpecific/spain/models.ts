import type { OptimizationResultBase, SharedOptimizeRequestFields, StateOption } from "../../../types/models";
import type { OptimizationFormDefaults, OptimizationYearRange } from "../shared/models";

export interface SpainOptimizeScope {
    type: "national" | "state" | "city";
    stateCode: string | null;
    stateName: string | null;
    cityCode: string | null;
    cityName: string | null;
}

export interface SpainOptimizeResult extends OptimizationResultBase {
    countryCode: "ES";
    scope: SpainOptimizeScope;
}

export interface SpainOptimizeRequest extends SharedOptimizeRequestFields {
    country: "ES";
    stateCode?: string;
    cityCode?: string;
    state?: never;
}

export interface SpainCityOption {
    code: string;
    name: string;
    stateCode: string;
}

export interface SpainCountrySchema {
    countryCode: "ES";
    component: "spain";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    states: StateOption[];
    cities: SpainCityOption[];
}
