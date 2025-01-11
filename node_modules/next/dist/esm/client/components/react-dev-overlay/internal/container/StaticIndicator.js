import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Toast } from '../components/Toast';
import { LightningBolt } from '../icons/LightningBolt';
import { CloseIcon } from '../icons/CloseIcon';
export function StaticIndicator(param) {
    let { dispatcher } = param;
    return /*#__PURE__*/ _jsxs(Toast, {
        role: "status",
        className: "nextjs-static-indicator-toast-wrapper",
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "nextjs-static-indicator-toast-icon",
                children: /*#__PURE__*/ _jsx(LightningBolt, {})
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "nextjs-static-indicator-toast-text",
                children: [
                    "Static route",
                    /*#__PURE__*/ _jsx("button", {
                        onClick: ()=>{
                            var _localStorage;
                            // When dismissed, we hide the indicator for 1 hour. Store the
                            // timestamp for when to show it again.
                            const oneHourAway = Date.now() + 1 * 60 * 60 * 1000;
                            (_localStorage = localStorage) == null ? void 0 : _localStorage.setItem('__NEXT_DISMISS_PRERENDER_INDICATOR', oneHourAway.toString());
                            dispatcher == null ? void 0 : dispatcher.onStaticIndicator(false);
                        },
                        className: "nextjs-toast-hide-button",
                        "aria-label": "Hide static indicator",
                        children: /*#__PURE__*/ _jsx(CloseIcon, {})
                    })
                ]
            })
        ]
    });
}

//# sourceMappingURL=StaticIndicator.js.map