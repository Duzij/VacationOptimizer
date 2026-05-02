import type { OptimizeRequest, OptimizeResult } from "../../types/models";
import type { IndiaOptimizeRequest, IndiaOptimizeResult } from "./india/models";
import type { SpainOptimizeRequest, SpainOptimizeResult } from "./spain/models";
import type { SwitzerlandOptimizeRequest, SwitzerlandOptimizeResult } from "./switzerland/models";

export type {
    IndiaCountrySchema,
    IndiaOptimizeRequest,
    IndiaOptimizeResult,
    IndiaOptimizeScope,
} from "./india/models";
export type {
    SpainCityOption,
    SpainCountrySchema,
    SpainOptimizeRequest,
    SpainOptimizeResult,
    SpainOptimizeScope,
} from "./spain/models";
export type {
    SwitzerlandCountrySchema,
    SwitzerlandOptimizeRequest,
    SwitzerlandOptimizeResult,
    SwitzerlandOptimizeScope,
} from "./switzerland/models";
export type { OptimizationFormDefaults, OptimizationYearRange } from "./shared/models";

export function isIndiaOptimizeRequest(request: OptimizeRequest | null | undefined): request is IndiaOptimizeRequest {
    return request?.country === "IN";
}

export function isSpainOptimizeRequest(request: OptimizeRequest | null | undefined): request is SpainOptimizeRequest {
    return request?.country === "ES";
}

export function isSwitzerlandOptimizeRequest(request: OptimizeRequest | null | undefined): request is SwitzerlandOptimizeRequest {
    return request?.country === "CH";
}

export function isIndiaOptimizeResult(result: OptimizeResult | null | undefined): result is IndiaOptimizeResult {
    return result?.countryCode === "IN";
}

export function isSpainOptimizeResult(result: OptimizeResult | null | undefined): result is SpainOptimizeResult {
    return result?.countryCode === "ES";
}

export function isSwitzerlandOptimizeResult(result: OptimizeResult | null | undefined): result is SwitzerlandOptimizeResult {
    return result?.countryCode === "CH";
}

export function getOptimizeRequestScopeCode(request: OptimizeRequest | null | undefined) {
    if (!request) {
        return "";
    }

    if (isIndiaOptimizeRequest(request)) {
        return request.stateCode;
    }

    if (isSpainOptimizeRequest(request)) {
        return request.cityCode ?? request.stateCode ?? "";
    }

    if (isSwitzerlandOptimizeRequest(request)) {
        return request.cantonCode;
    }

    return request.state ?? "";
}
