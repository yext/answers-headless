import {
  VerticalSearchRequest,
  UniversalSearchRequest,
  SearchIntent
} from '@yext/answers-core';
import HttpManager from '../../src/http-manager';
import ReduxStateManager from '../../src/redux-state-manager';
import AnswersHeadless from '../../src/answers-headless';
import { createMockedAnswersHeadless } from '../mocks/createMockedAnswersHeadless';
import { createBaseStore } from '../../src/store';
import { DEFAULT_HEADLESS_ID } from '../../src/constants';
import HeadlessReducerManager from '../../src/headless-reducer-manager';

it('vertical searches set search intents', async () => {
  const mockSearch = jest.fn((_request: VerticalSearchRequest) => Promise.resolve({
    searchIntents: [SearchIntent.NearMe]
  }));
  const answers = createMockedAnswersHeadless({
    verticalSearch: mockSearch
  });
  answers.setVerticalKey('vertical-key');
  expect(answers.state.query.searchIntents).toEqual(undefined);
  await answers.executeVerticalQuery();
  expect(answers.state.query.searchIntents).toEqual(['NEAR_ME']);
});

it('related query search a grouped with updated uuid', async () => {
  const mockUniversalSearch = jest.fn().mockReturnValue(Promise.resolve({}));
  const mockVerticalSearch = jest.fn().mockReturnValue(Promise.resolve({}));
  const answers = createMockedAnswersHeadless({
    universalSearch: mockUniversalSearch,
    verticalSearch: mockVerticalSearch
  });
  answers.setVerticalKey('vertical-key');

  answers.setAutocompleteSessionId('some-uuid-value');
  await answers.executeUniversalQuery();
  await answers.executeVerticalQuery();
  expect(mockUniversalSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({ autocompleteSessionId: 'some-uuid-value' })
  );
  expect(mockVerticalSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({ autocompleteSessionId: 'some-uuid-value' })
  );

  answers.setAutocompleteSessionId('different-uuid-value');
  await answers.executeUniversalQuery();
  await answers.executeVerticalQuery();
  expect(mockUniversalSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({ autocompleteSessionId: 'different-uuid-value' })
  );
  expect(mockVerticalSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({ autocompleteSessionId: 'different-uuid-value' })
  );
});

it('universal searches set search intents', async () => {
  const mockSearch = jest.fn((_request: UniversalSearchRequest) => Promise.resolve({
    searchIntents: [SearchIntent.NearMe]
  }));
  const answers = createMockedAnswersHeadless({
    universalSearch: mockSearch
  });
  expect(answers.state.query.searchIntents).toEqual(undefined);
  await answers.executeUniversalQuery();
  expect(answers.state.query.searchIntents).toEqual(['NEAR_ME']);
});

describe('ensure correct results from latest request', () => {
  jest.useFakeTimers();
  const queries = ['really long request', 'short', 'long request'];
  const requestsTime = {
    [queries[0]]: 20,
    [queries[1]]: 5,
    [queries[2]]: 12
  };

  const mockedCore: any = {
    verticalSearch: jest.fn( async (request: VerticalSearchRequest) => {
      const waitTime = requestsTime[request.query];
      return new Promise(res => setTimeout(() => res(
        { verticalResults: { results: [request.query] } }), waitTime));
    }),
    universalSearch: jest.fn( async (request: UniversalSearchRequest) => {
      const waitTime = requestsTime[request.query];
      return new Promise(res => setTimeout(() => res(
        { verticalResults: [{ results: [request.query] }] }), waitTime));
    })
  };
  const stateManager = new ReduxStateManager(
    createBaseStore(), DEFAULT_HEADLESS_ID, new HeadlessReducerManager());
  const httpManager = new HttpManager();
  const answers = new AnswersHeadless(mockedCore, stateManager, httpManager);
  answers.setVerticalKey('someKey');
  const updateResult = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('vertical search get correct results based on up-to-date response', async () => {
    answers.addListener({
      valueAccessor: state => state.vertical?.results,
      callback: updateResult
    });
    answers.setQuery(queries[0]);
    const firstResponsePromise = answers.executeVerticalQuery();
    answers.setQuery(queries[1]);
    const secondResponsePromise = answers.executeVerticalQuery();
    answers.setQuery(queries[2]);
    const thirdResponsePromise = answers.executeVerticalQuery();

    jest.advanceTimersByTime(requestsTime[queries[1]]);
    await secondResponsePromise;
    expect(answers.state.vertical.results).toEqual([queries[1]]);
    jest.advanceTimersByTime(requestsTime[queries[2]]);
    await thirdResponsePromise;
    jest.runAllTimers();
    await firstResponsePromise;

    expect(answers.state.query.input).toEqual(queries[2]);
    expect(answers.state.vertical.results).toEqual([queries[2]]);
    expect(updateResult.mock.calls).toHaveLength(2);
  });

  it('universal search get correct results based on up-to-date response', async () => {
    answers.addListener({
      valueAccessor: state => state.universal.verticals,
      callback: updateResult
    });
    answers.setQuery(queries[0]);
    const firstResponsePromise = answers.executeUniversalQuery();
    answers.setQuery(queries[1]);
    const secondResponsePromise = answers.executeUniversalQuery();
    answers.setQuery(queries[2]);
    const thirdResponsePromise = answers.executeUniversalQuery();

    jest.advanceTimersByTime(requestsTime[queries[1]]);
    await secondResponsePromise;
    expect(answers.state.universal.verticals).toEqual([{ results: [queries[1]] }]);
    jest.advanceTimersByTime(requestsTime[queries[2]]);
    await thirdResponsePromise;
    jest.runAllTimers();
    await firstResponsePromise;

    expect(answers.state.query.input).toEqual(queries[2]);
    expect(answers.state.universal.verticals).toEqual([{ results: [queries[2]] }]);
    expect(updateResult.mock.calls).toHaveLength(2);
  });
});
