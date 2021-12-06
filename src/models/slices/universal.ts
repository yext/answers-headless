import { UniversalLimit, VerticalResults } from '@yext/answers-core';

/**
 * The state for a universal search.
 */
export interface UniversalSearchState {
  /**
   * An object defining the limit (up to how many results should be returned) for
   * each vertical.
   */
  limit?: UniversalLimit,
  /**
   * The results from each vertical included in the universal search.
   */
  verticals?: VerticalResults[],
  /**
   * If included, the verticals to which the universal search should be restricted.
   */
  restrictVerticals?: string[]
}