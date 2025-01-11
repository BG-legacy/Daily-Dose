import type { Segment } from './types';
import type { ManifestNode } from '../../build/webpack/plugins/flight-manifest-plugin';
import type { LoadingModuleData } from '../../shared/lib/app-router-context.shared-runtime';
export type RootTreePrefetch = {
    buildId: string;
    tree: TreePrefetch;
    head: React.ReactNode | null;
    isHeadPartial: boolean;
    staleTime: number;
};
export type TreePrefetch = {
    token: string;
    path: string;
    slots: null | {
        [parallelRouteKey: string]: TreePrefetch;
    };
    extra: [segment: Segment, isRootLayout: boolean];
};
export type SegmentPrefetch = {
    buildId: string;
    rsc: React.ReactNode | null;
    loading: LoadingModuleData | Promise<LoadingModuleData>;
    isPartial: boolean;
};
export declare function collectSegmentData(fullPageDataBuffer: Buffer, staleTime: number, clientModules: ManifestNode, serverConsumerManifest: any): Promise<Map<string, Buffer>>;
