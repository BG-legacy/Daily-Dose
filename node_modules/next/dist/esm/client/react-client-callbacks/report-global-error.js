export const reportGlobalError = typeof reportError === 'function' ? // emulating an uncaught JavaScript error.
reportError : (error)=>{
    window.console.error(error);
};

//# sourceMappingURL=report-global-error.js.map