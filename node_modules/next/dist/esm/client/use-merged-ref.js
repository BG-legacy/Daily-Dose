import { useMemo, useRef } from 'react';
// This is a compatibility hook to support React 18 and 19 refs.
// In 19, a cleanup function from refs may be returned.
// In 18, returning a cleanup function creates a warning.
// Since we take userspace refs, we don't know ahead of time if a cleanup function will be returned.
// This implements cleanup functions with the old behavior in 18.
// We know refs are always called alternating with `null` and then `T`.
// So a call with `null` means we need to call the previous cleanup functions.
export function useMergedRef(refA, refB) {
    const cleanupA = useRef(()=>{});
    const cleanupB = useRef(()=>{});
    return useMemo(()=>{
        if (!refA || !refB) {
            return refA || refB;
        }
        return (current)=>{
            if (current === null) {
                cleanupA.current();
                cleanupB.current();
            } else {
                cleanupA.current = applyRef(refA, current);
                cleanupB.current = applyRef(refB, current);
            }
        };
    }, [
        refA,
        refB
    ]);
}
function applyRef(refA, current) {
    if (typeof refA === 'function') {
        const cleanup = refA(current);
        if (typeof cleanup === 'function') {
            return cleanup;
        } else {
            return ()=>refA(null);
        }
    } else {
        refA.current = current;
        return ()=>{
            refA.current = null;
        };
    }
}

//# sourceMappingURL=use-merged-ref.js.map