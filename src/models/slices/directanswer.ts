import { FeaturedSnippetDirectAnswer, FieldValueDirectAnswer } from '@yext/search-core';

/**
 * Maintains the direct answer associated with the latest search.
 *
 * @public
 */
export interface DirectAnswerState {
  /**
   * The data for the direct answer. The type of the data is determined by the
   * Search API based on whether the answer was found within a document or was a
   * field value in the knowledge graph.
   */
  result?: FeaturedSnippetDirectAnswer | FieldValueDirectAnswer
}