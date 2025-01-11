declare const digestSym: unique symbol;
declare const consoleTypeSym: unique symbol;
type UnhandledError = Error & {
    [digestSym]: 'NEXT_UNHANDLED_ERROR';
    [consoleTypeSym]: 'string' | 'error';
};
export declare function createUnhandledError(message: string | Error): UnhandledError;
export declare const isUnhandledConsoleOrRejection: (error: any) => error is UnhandledError;
export declare const getUnhandledErrorType: (error: UnhandledError) => "string" | "error";
export {};
