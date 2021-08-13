import { useAnswersState } from '@yext/answers-headless'

export default function ResultsCount() {
  const count = useAnswersState(state => state.vertical.results?.verticalResults.resultsCount);

  return (
    <div> #Results - {count || 0} </div>
  )
}