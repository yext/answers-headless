import { FiltersState } from './slices/filters';
import { QueryState } from './slices/query';
import { UniversalSearchState } from './slices/universal';
import { VerticalSearchState } from './slices/vertical';
import { SpellCheckState } from './slices/spellcheck';
import { MetaState } from './slices/meta';
import { LocationState } from './slices/location';
import { SessionTrackingState } from './slices/sessiontracking';
import { DirectAnswerState } from './slices/directanswer';
import { SearchStatusState } from './slices/searchstatus';

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
  directAnswer: DirectAnswerState,
  filters: FiltersState,
  searchStatus: SearchStatusState,
  spellCheck: SpellCheckState,
  sessionTracking: SessionTrackingState,
  meta: MetaState,
  location: LocationState,
}
