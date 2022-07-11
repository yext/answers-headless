import { LatLong, LocationBias } from '@yext/search-core';

/**
 * Maintains the user's location, if given, or the inferred location, that is
 * used to bias search results.
 *
 * @public
 */
export interface LocationState {
  /**
   * The geographical location bias used in the search, returned from the
   * Search API.
   */
  locationBias?: LocationBias,
  /**
   * The latitude and longitude of the user making the request. Used to bias
   * the results.
   */
  userLocation?: LatLong
}