import type { NodeNextRequest, NodeNextResponse } from '../base-http/node';
import type { LoggingConfig } from '../config-shared';
export interface RequestLoggingOptions {
    readonly request: NodeNextRequest;
    readonly response: NodeNextResponse;
    readonly loggingConfig: LoggingConfig | undefined;
    readonly requestDurationInMs: number;
}
export declare function logRequests(options: RequestLoggingOptions): void;
