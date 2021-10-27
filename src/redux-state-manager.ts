import { EnhancedStore, Unsubscribe } from '@reduxjs/toolkit';
import StateListener from './models/state-listener';
import StateManager from './models/state-manager';
import { ParentState, State } from './models/state';
import ReducerManager from './reducer-manager';
import { ActionWithHeadlessId } from './store';

/**
 * A Redux-backed implementation of the {@link StateManager} interface. Redux is used to
 * manage the state, dispatch events, and register state listeners.
 */
export default class ReduxStateManager implements StateManager {
  constructor(
    private store: EnhancedStore<ParentState, ActionWithHeadlessId>,
    private headlessId: string,
    reducerManager: ReducerManager
  ) {
    reducerManager.addReducer(this.headlessId);
    store.replaceReducer(reducerManager.getCombinedReducer());
  }

  getState(): State {
    const state = this.store.getState();
    return state[this.headlessId];
  }

  /**
   * For actions other than set-state, the action type is given a prefix to designate which
   * AnswersHeadless instance it should affect.
   */
  dispatchEvent(type: string, payload?: unknown): void {
    const answersActionType = type === 'set-state' ? 'set-state' : this.headlessId + '/' + type;
    this.store.dispatch({
      type: answersActionType,
      payload,
      headlessId: this.headlessId
    });
  }

  addListener<T>(listener: StateListener<T>): Unsubscribe {
    let previousValue = listener.valueAccessor(this.getState());
    return this.store.subscribe(() => {
      const currentValue: T = listener.valueAccessor(this.getState());
      if (currentValue !== previousValue) {
        previousValue = currentValue;
        listener.callback(currentValue);
      }
    });
  }
}