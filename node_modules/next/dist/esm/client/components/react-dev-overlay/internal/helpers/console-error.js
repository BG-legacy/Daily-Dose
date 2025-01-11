// To distinguish from React error.digest, we use a different symbol here to determine if the error is from console.error or unhandled promise rejection.
const digestSym = Symbol.for('next.console.error.digest');
const consoleTypeSym = Symbol.for('next.console.error.type');
export function createUnhandledError(message) {
    const error = typeof message === 'string' ? new Error(message) : message;
    error[digestSym] = 'NEXT_UNHANDLED_ERROR';
    error[consoleTypeSym] = typeof message === 'string' ? 'string' : 'error';
    return error;
}
export const isUnhandledConsoleOrRejection = (error)=>{
    return error && error[digestSym] === 'NEXT_UNHANDLED_ERROR';
};
export const getUnhandledErrorType = (error)=>{
    return error[consoleTypeSym];
};

//# sourceMappingURL=console-error.js.map