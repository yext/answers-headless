import { configureStore, combineReducers, EnhancedStore, Unsubscribe } from '@reduxjs/toolkit';

import queryReducer from './slices/query';
import verticalReducer from './slices/vertical';
import universalReducer from './slices/universal';
import filtersReducer from './slices/filters';
import spellCheckReducer from './slices/spellcheck';
import StateListener from './models/state-listener';
import StateManager from './models/state-manager';
import { State } from './models/state';

/**
 * A Redux-backed implementation of the {@link StateManager} interface. Redux is used to
 * manage the state, dispatch events, and register state listeners.
 */
export default class ReduxStateManager implements StateManager {
  private store: EnhancedStore;

  constructor(preloadedState = undefined) {
    const coreReducer = combineReducers({
      query: queryReducer,
      vertical: verticalReducer,
      universal: universalReducer,
      filters: filtersReducer,
      spellCheck: spellCheckReducer
    });

    this.store = configureStore({
      middleware:
        (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
      preloadedState: preloadedState,
      reducer: (state, action) => {
        if (action.type === 'set-state') {
          return action.payload;
        } else {
          return coreReducer(state, action);
        }
      },
    });
  }

  getState(): State {
    return this.store.getState();
  }

  dispatchEvent(type, payload): void {
    this.store.dispatch({ type, payload });
  }

  addListener<T>(listener: StateListener<T>): Unsubscribe {
    let previousValue: T;
    return this.store.subscribe(() => {
      const currentValue: T = listener.valueAccessor(this.getState());
      if (currentValue !== previousValue) {
        listener.callback(currentValue);
        previousValue = currentValue;
      }
    });
  }
}