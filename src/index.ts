import { provideCore, AnswersConfig, AdditionalHttpHeaders } from '@yext/answers-core';
import HttpManager from './http-manager';
import ReduxStateManager from './redux-state-manager';
import AnswersHeadless from './answers-headless';
import { createBaseStore } from './store';
import HeadlessReducerManager from './headless-reducer-manager';
import { DEFAULT_HEADLESS_ID } from './constants';
import { SessionTrackingState } from './models/slices/sessiontracking';
import * as answersUtilities from './answers-utilities';
import { getHttpHeaders } from './utils/client-sdk-utils';

export * from './answers-core-re-exports';
export * from './models';
export * from './constants';
export * from './utils/filter-creators';
export * from './utils/types';
export { answersUtilities };

/**
 * The configuration for an AnswersHeadless instance.
 *
 * @public
 */
export type HeadlessConfig = AnswersConfig & {
  /**
   * The ID of the AnswersHeadless instance.
   *
   * @remarks
   * Must be different from {@link DEFAULT_HEADLESS_ID}.
   */
  headlessId?: string,
  /**
   * The verticalKey associated with the vertical to manage. If none is provided,
   * Answers Headless will manage universal search.
   */
  verticalKey?: string
};

let firstHeadlessInstance: AnswersHeadless;
const store = createBaseStore();
const headlessReducerManager = new HeadlessReducerManager();

/**
 * Supplies a new instance of {@link AnswersHeadless}, using the provided configuration.
 *
 * @param config - The apiKey, experienceKey, etc. needed to set up a front-end Answers
 *                 experience.
 * @returns The newly created instance of {@link AnswersHeadless}
 *
 * @public
 */
export function provideAnswersHeadless(config: HeadlessConfig): AnswersHeadless;

/**
 * Supplies a new instance of {@link AnswersHeadless}, using the provided configuration,
 * and accepts additional HTTP headers to pass with API requests.
 *
 * @param config - The apiKey, experienceKey, etc. needed to set up a front-end Answers
 *                 experience
 * @param additionalHttpHeaders - Additional value for specific HTTP headers
 * @returns The newly created instance of {@link AnswersHeadless}
 *
 * @internal
 */
// eslint-disable-next-line @yext/export-star/no-duplicate-exports
export function provideAnswersHeadless(
  config: HeadlessConfig,
  additionalHttpHeaders: AdditionalHttpHeaders
): AnswersHeadless;

// eslint-disable-next-line @yext/export-star/no-duplicate-exports
export function provideAnswersHeadless(
  config: HeadlessConfig,
  additionalHttpHeaders?: AdditionalHttpHeaders
): AnswersHeadless {
  const {
    verticalKey,
    headlessId,
    ...answersConfig
  } = config;
  if (headlessId === DEFAULT_HEADLESS_ID) {
    throw new Error(`Cannot instantiate an AnswersHeadless using the default headlessId "${headlessId}". `
      + 'Specify a different headlessId.');
  }
  const answersCore = provideCore(answersConfig);
  const stateManager = new ReduxStateManager(
    store, headlessId || DEFAULT_HEADLESS_ID, headlessReducerManager);
  const httpManager = new HttpManager();
  const httpHeaders = getHttpHeaders(additionalHttpHeaders);

  const headless = new AnswersHeadless(answersCore, stateManager, httpManager, httpHeaders);
  verticalKey
    ? headless.setVertical(verticalKey)
    : headless.setUniversal();
  if (!firstHeadlessInstance) {
    firstHeadlessInstance = headless;
  } else {
    // Two-way bind the current headless instances with the first one instantiated on the page.
    // This way, all headless instances on a page will have their sessionTracking states linked.
    // We have to be careful not to create an infinite loop here.
    linkSessionTracking(firstHeadlessInstance, headless);
    linkSessionTracking(headless, firstHeadlessInstance);
  }
  return headless;
}

/**
 * Links the secondHeadless instance to sessionTracking updates made to the firstHeadless
 * instance.
 */
function linkSessionTracking(firstHeadless: AnswersHeadless, secondHeadless: AnswersHeadless) {
  firstHeadless.addListener<SessionTrackingState>({
    valueAccessor: state => state.sessionTracking,
    callback: sessionTracking => {
      secondHeadless.setState({
        ...secondHeadless.state,
        sessionTracking
      });
    }
  });
}

export { AnswersHeadless };
