import type { Dispatch } from 'react';
import type { AppRouterState, ReducerActions, ReducerState } from './router-reducer/router-reducer-types';
import type { AppRouterActionQueue } from '../../shared/lib/router/action-queue';
export declare function useUnwrapState(state: ReducerState): AppRouterState;
export declare function useReducer(actionQueue: AppRouterActionQueue): [ReducerState, Dispatch<ReducerActions>];
