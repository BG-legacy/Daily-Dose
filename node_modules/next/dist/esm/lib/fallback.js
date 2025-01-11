/**
 * Describes the different fallback modes that a given page can have.
 */ export var FallbackMode = /*#__PURE__*/ function(FallbackMode) {
    /**
   * A BLOCKING_STATIC_RENDER fallback will block the request until the page is
   * generated. No fallback page will be rendered, and users will have to wait
   * to render the page.
   */ FallbackMode["BLOCKING_STATIC_RENDER"] = "BLOCKING_STATIC_RENDER";
    /**
   * When set to PRERENDER, a fallback page will be sent to users in place of
   * forcing them to wait for the page to be generated. This allows the user to
   * see a rendered page earlier.
   */ FallbackMode["PRERENDER"] = "PRERENDER";
    /**
   * When set to NOT_FOUND, pages that are not already prerendered will result
   * in a not found response.
   */ FallbackMode["NOT_FOUND"] = "NOT_FOUND";
    return FallbackMode;
}({});
/**
 * Parses the fallback field from the prerender manifest.
 *
 * @param fallbackField The fallback field from the prerender manifest.
 * @returns The fallback mode.
 */ export function parseFallbackField(fallbackField) {
    if (typeof fallbackField === 'string') {
        return "PRERENDER";
    } else if (fallbackField === null) {
        return "BLOCKING_STATIC_RENDER";
    } else if (fallbackField === false) {
        return "NOT_FOUND";
    } else if (fallbackField === undefined) {
        return undefined;
    } else {
        throw new Error(`Invalid fallback option: ${fallbackField}. Fallback option must be a string, null, undefined, or false.`);
    }
}
export function fallbackModeToFallbackField(fallback, page) {
    switch(fallback){
        case "BLOCKING_STATIC_RENDER":
            return null;
        case "NOT_FOUND":
            return false;
        case "PRERENDER":
            if (!page) {
                throw new Error(`Invariant: expected a page to be provided when fallback mode is "${fallback}"`);
            }
            return page;
        default:
            throw new Error(`Invalid fallback mode: ${fallback}`);
    }
}
/**
 * Parses the fallback from the static paths result.
 *
 * @param result The result from the static paths function.
 * @returns The fallback mode.
 */ export function parseStaticPathsResult(result) {
    if (result === true) {
        return "PRERENDER";
    } else if (result === 'blocking') {
        return "BLOCKING_STATIC_RENDER";
    } else {
        return "NOT_FOUND";
    }
}
/**
 * Converts the fallback mode to a static paths result.
 *
 * @param fallback The fallback mode.
 * @returns The static paths fallback result.
 */ export function fallbackModeToStaticPathsResult(fallback) {
    switch(fallback){
        case "PRERENDER":
            return true;
        case "BLOCKING_STATIC_RENDER":
            return 'blocking';
        case "NOT_FOUND":
        default:
            return false;
    }
}

//# sourceMappingURL=fallback.js.map