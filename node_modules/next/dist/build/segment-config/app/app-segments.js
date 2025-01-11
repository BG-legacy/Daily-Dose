"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "collectSegments", {
    enumerable: true,
    get: function() {
        return collectSegments;
    }
});
const _appsegmentconfig = require("./app-segment-config");
const _invarianterror = require("../../../shared/lib/invariant-error");
const _checks = require("../../../server/route-modules/checks");
const _clientreference = require("../../../lib/client-reference");
const _getsegmentparam = require("../../../server/app-render/get-segment-param");
const _appdirmodule = require("../../../server/lib/app-dir-module");
const _segment = require("../../../shared/lib/segment");
/**
 * Parses the app config and attaches it to the segment.
 */ function attach(segment, userland, route) {
    // If the userland is not an object, then we can't do anything with it.
    if (typeof userland !== 'object' || userland === null) {
        return;
    }
    // Try to parse the application configuration.
    const config = (0, _appsegmentconfig.parseAppSegmentConfig)(userland, route);
    // If there was any keys on the config, then attach it to the segment.
    if (Object.keys(config).length > 0) {
        segment.config = config;
    }
    if ('generateStaticParams' in userland && typeof userland.generateStaticParams === 'function') {
        var _segment_config;
        segment.generateStaticParams = userland.generateStaticParams;
        // Validate that `generateStaticParams` makes sense in this context.
        if (((_segment_config = segment.config) == null ? void 0 : _segment_config.runtime) === 'edge') {
            throw new Error('Edge runtime is not supported with `generateStaticParams`.');
        }
    }
}
/**
 * Walks the loader tree and collects the generate parameters for each segment.
 *
 * @param routeModule the app page route module
 * @returns the segments for the app page route module
 */ async function collectAppPageSegments(routeModule) {
    // We keep track of unique segments, since with parallel routes, it's possible
    // to see the same segment multiple times.
    const uniqueSegments = new Map();
    const queue = [
        [
            routeModule.userland.loaderTree,
            []
        ]
    ];
    while(queue.length > 0){
        var _getSegmentParam;
        const [loaderTree, currentSegments] = queue.shift();
        const [name, parallelRoutes] = loaderTree;
        // Process current node
        const { mod: userland, filePath } = await (0, _appdirmodule.getLayoutOrPageModule)(loaderTree);
        const isClientComponent = userland && (0, _clientreference.isClientReference)(userland);
        const isDynamicSegment = /\[.*\]$/.test(name);
        const param = isDynamicSegment ? (_getSegmentParam = (0, _getsegmentparam.getSegmentParam)(name)) == null ? void 0 : _getSegmentParam.param : undefined;
        const segment = {
            name,
            param,
            filePath,
            config: undefined,
            isDynamicSegment,
            generateStaticParams: undefined
        };
        // Only server components can have app segment configurations
        if (!isClientComponent) {
            attach(segment, userland, routeModule.definition.pathname);
        }
        // Create a unique key for the segment
        const segmentKey = getSegmentKey(segment);
        if (!uniqueSegments.has(segmentKey)) {
            uniqueSegments.set(segmentKey, segment);
        }
        const updatedSegments = [
            ...currentSegments,
            segment
        ];
        // If this is a page segment, we've reached a leaf node
        if (name === _segment.PAGE_SEGMENT_KEY) {
            // Add all segments in the current path
            updatedSegments.forEach((seg)=>{
                const key = getSegmentKey(seg);
                uniqueSegments.set(key, seg);
            });
        }
        // Add all parallel routes to the queue
        for(const parallelRouteKey in parallelRoutes){
            const parallelRoute = parallelRoutes[parallelRouteKey];
            queue.push([
                parallelRoute,
                updatedSegments
            ]);
        }
    }
    return Array.from(uniqueSegments.values());
}
function getSegmentKey(segment) {
    return `${segment.name}-${segment.filePath ?? ''}-${segment.param ?? ''}`;
}
/**
 * Collects the segments for a given app route module.
 *
 * @param routeModule the app route module
 * @returns the segments for the app route module
 */ function collectAppRouteSegments(routeModule) {
    // Get the pathname parts, slice off the first element (which is empty).
    const parts = routeModule.definition.pathname.split('/').slice(1);
    if (parts.length === 0) {
        throw new _invarianterror.InvariantError('Expected at least one segment');
    }
    // Generate all the segments.
    const segments = parts.map((name)=>{
        var _getSegmentParam;
        const isDynamicSegment = /^\[.*\]$/.test(name);
        const param = isDynamicSegment ? (_getSegmentParam = (0, _getsegmentparam.getSegmentParam)(name)) == null ? void 0 : _getSegmentParam.param : undefined;
        return {
            name,
            param,
            filePath: undefined,
            isDynamicSegment,
            config: undefined,
            generateStaticParams: undefined
        };
    });
    // We know we have at least one, we verified this above. We should get the
    // last segment which represents the root route module.
    const segment = segments[segments.length - 1];
    segment.filePath = routeModule.definition.filename;
    // Extract the segment config from the userland module.
    attach(segment, routeModule.userland, routeModule.definition.pathname);
    return segments;
}
function collectSegments({ routeModule }) {
    if ((0, _checks.isAppRouteRouteModule)(routeModule)) {
        return collectAppRouteSegments(routeModule);
    }
    if ((0, _checks.isAppPageRouteModule)(routeModule)) {
        return collectAppPageSegments(routeModule);
    }
    throw new _invarianterror.InvariantError('Expected a route module to be one of app route or page');
}

//# sourceMappingURL=app-segments.js.map