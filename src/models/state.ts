import { FiltersState } from './slices/filters';
import { QueryState } from './slices/query';
import { UniversalSearchState } from './slices/universal';
import { VerticalSearchState } from './slices/vertical';
import { SpellCheckState } from './slices/spellcheck';
import { MetaState } from './slices/meta';
import { LocationState } from './slices/location';
import { SessionTrackingState } from './slices/sessiontracking';
import { FilterSearchStates } from './slices/filtersearch';

/**
 * The overall shape of the redux state tree, with each key value pair
 * of headlessId to {@link State} representing a single AnswersHeadless instance.
 */
export interface ParentState {
  [headlessId: string]: State
}

export interface State {
  query: QueryState,
  universal: UniversalSearchState,
  vertical: VerticalSearchState,
  filterSearch: FilterSearchStates,
  filters: FiltersState,
  spellCheck: SpellCheckState,
  sessionTracking: SessionTrackingState
  meta: MetaState,
  location: LocationState,
}
