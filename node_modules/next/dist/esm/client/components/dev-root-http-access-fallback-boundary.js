'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { HTTPAccessFallbackBoundary } from './http-access-fallback/error-boundary';
// TODO: error on using forbidden and unauthorized in root layout
export function bailOnRootNotFound() {
    throw new Error('notFound() is not allowed to use in root layout');
}
function NotAllowedRootHTTPFallbackError() {
    bailOnRootNotFound();
    return null;
}
export function DevRootHTTPAccessFallbackBoundary(param) {
    let { children } = param;
    return /*#__PURE__*/ _jsx(HTTPAccessFallbackBoundary, {
        notFound: /*#__PURE__*/ _jsx(NotAllowedRootHTTPFallbackError, {}),
        children: children
    });
}

//# sourceMappingURL=dev-root-http-access-fallback-boundary.js.map