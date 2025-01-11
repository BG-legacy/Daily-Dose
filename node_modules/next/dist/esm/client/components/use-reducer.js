import React, { use } from 'react';
import { useCallback } from 'react';
import { isThenable } from '../../shared/lib/is-thenable';
export function useUnwrapState(state) {
    // reducer actions can be async, so sometimes we need to suspend until the state is resolved
    if (isThenable(state)) {
        const result = use(state);
        return result;
    }
    return state;
}
export function useReducer(actionQueue) {
    const [state, setState] = React.useState(actionQueue.state);
    const dispatch = useCallback((action)=>{
        actionQueue.dispatch(action, setState);
    }, [
        actionQueue
    ]);
    return [
        state,
        dispatch
    ];
}

//# sourceMappingURL=use-reducer.js.map