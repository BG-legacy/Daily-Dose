// This file is only used in app router due to the specific error state handling.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    onCaughtError: null,
    onUncaughtError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    onCaughtError: function() {
        return onCaughtError;
    },
    onUncaughtError: function() {
        return onUncaughtError;
    }
});
const _stitchederror = require("../components/react-dev-overlay/internal/helpers/stitched-error");
const _useerrorhandler = require("../components/react-dev-overlay/internal/helpers/use-error-handler");
const _isnextroutererror = require("../components/is-next-router-error");
const _bailouttocsr = require("../../shared/lib/lazy-dynamic/bailout-to-csr");
const _reportglobalerror = require("./report-global-error");
const _interceptconsoleerror = require("../components/globals/intercept-console-error");
const onCaughtError = (err, errorInfo)=>{
    // Skip certain custom errors which are not expected to be reported on client
    if ((0, _bailouttocsr.isBailoutToCSRError)(err) || (0, _isnextroutererror.isNextRouterError)(err)) return;
    if (process.env.NODE_ENV !== 'production') {
        var _errorInfo_errorBoundary, _errorInfo_componentStack;
        const errorBoundaryComponent = errorInfo == null ? void 0 : (_errorInfo_errorBoundary = errorInfo.errorBoundary) == null ? void 0 : _errorInfo_errorBoundary.constructor;
        const errorBoundaryName = (// read react component displayName
        errorBoundaryComponent == null ? void 0 : errorBoundaryComponent.displayName) || (errorBoundaryComponent == null ? void 0 : errorBoundaryComponent.name) || 'Unknown';
        const componentThatErroredFrame = errorInfo == null ? void 0 : (_errorInfo_componentStack = errorInfo.componentStack) == null ? void 0 : _errorInfo_componentStack.split('\n')[1];
        var // regex to match the function name in the stack trace
        // example 1: at Page (http://localhost:3000/_next/static/chunks/pages/index.js?ts=1631600000000:2:1)
        // example 2: Page@http://localhost:3000/_next/static/chunks/pages/index.js?ts=1631600000000:2:1
        _componentThatErroredFrame_match;
        // Match chrome or safari stack trace
        const matches = (_componentThatErroredFrame_match = componentThatErroredFrame == null ? void 0 : componentThatErroredFrame.match(/\s+at (\w+)\s+|(\w+)@/)) != null ? _componentThatErroredFrame_match : [];
        const componentThatErroredName = matches[1] || matches[2] || 'Unknown';
        // Create error location with errored component and error boundary, to match the behavior of default React onCaughtError handler.
        const errorBoundaryMessage = "It was handled by the <" + errorBoundaryName + "> error boundary.";
        const componentErrorMessage = componentThatErroredName ? "The above error occurred in the <" + componentThatErroredName + "> component." : "The above error occurred in one of your components.";
        const errorLocation = componentErrorMessage + " " + errorBoundaryMessage;
        const stitchedError = (0, _stitchederror.getReactStitchedError)(err);
        // TODO: change to passing down errorInfo later
        // In development mode, pass along the component stack to the error
        if (errorInfo.componentStack) {
            ;
            stitchedError._componentStack = errorInfo.componentStack;
        }
        // Log and report the error with location but without modifying the error stack
        (0, _interceptconsoleerror.originConsoleError)('%o\n\n%s', err, errorLocation);
        (0, _useerrorhandler.handleClientError)(stitchedError, []);
    } else {
        (0, _interceptconsoleerror.originConsoleError)(err);
    }
};
const onUncaughtError = (err, errorInfo)=>{
    // Skip certain custom errors which are not expected to be reported on client
    if ((0, _bailouttocsr.isBailoutToCSRError)(err) || (0, _isnextroutererror.isNextRouterError)(err)) return;
    if (process.env.NODE_ENV !== 'production') {
        var _errorInfo_componentStack;
        const componentThatErroredFrame = errorInfo == null ? void 0 : (_errorInfo_componentStack = errorInfo.componentStack) == null ? void 0 : _errorInfo_componentStack.split('\n')[1];
        var _componentThatErroredFrame_match;
        // Match chrome or safari stack trace
        const matches = (_componentThatErroredFrame_match = componentThatErroredFrame == null ? void 0 : componentThatErroredFrame.match(/\s+at (\w+)\s+|(\w+)@/)) != null ? _componentThatErroredFrame_match : [];
        const componentThatErroredName = matches[1] || matches[2] || 'Unknown';
        // Create error location with errored component and error boundary, to match the behavior of default React onCaughtError handler.
        const errorLocation = componentThatErroredName ? "The above error occurred in the <" + componentThatErroredName + "> component." : "The above error occurred in one of your components.";
        const stitchedError = (0, _stitchederror.getReactStitchedError)(err);
        // TODO: change to passing down errorInfo later
        // In development mode, pass along the component stack to the error
        if (errorInfo.componentStack) {
            ;
            stitchedError._componentStack = errorInfo.componentStack;
        }
        // Log and report the error with location but without modifying the error stack
        (0, _interceptconsoleerror.originConsoleError)('%o\n\n%s', err, errorLocation);
        (0, _reportglobalerror.reportGlobalError)(stitchedError);
    } else {
        (0, _reportglobalerror.reportGlobalError)(err);
    }
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=app-router.js.map