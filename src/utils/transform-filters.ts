import { FieldValueStaticFilter, FilterCombinator, StaticFilter } from '@yext/search-core';
import { SelectableStaticFilter } from '../models/utils/selectableStaticFilter';

/**
 * Combines a list of field value static filters using the logical OR operator
 * into a single {@link StaticFilter}.
 *
 * @returns The filters combined into a single {@link StaticFilter}
 */
function combineFiltersWithOR(filters: FieldValueStaticFilter[]): StaticFilter {
  if (filters.length === 1) {
    return filters[0];
  }
  return {
    kind: 'disjunction',
    combinator: FilterCombinator.OR,
    filters
  };
}

/**
 * Converts a list of {@link SelectableStaticFilter}s used in Search Headless
 * to a single static filter expected by Search Core.
 *
 * @param selectableFilters - The filters to be transformed
 * @returns The filters combined into a single {@link StaticFilter}
 */
export function transformFiltersToCoreFormat(
  selectableFilters: SelectableStaticFilter[] | undefined
): StaticFilter | null {
  if (!selectableFilters) {
    return null;
  }

  const selectedFilters: StaticFilter[] = selectableFilters
    .filter(selectableFilter => selectableFilter.selected)
    .map(selectableFilter => selectableFilter.filter);
  if (selectedFilters.length === 0) {
    return null;
  }
  if (selectedFilters.length === 1) {
    return selectedFilters[0];
  }

  const combinationFilters: StaticFilter[] = [];
  const groupedFilters: Record<string, FieldValueStaticFilter[]> = selectedFilters.reduce(
    (groups, filter) => {
      if (filter.kind !== 'fieldValue') {
        combinationFilters.push(filter);
      } else {
        groups[filter.fieldId]
          ? groups[filter.fieldId].push(filter)
          : groups[filter.fieldId] = [filter];
      }
      return groups;
    }, {}
  );

  const groupedFilterLabels = Object.keys(groupedFilters);
  if (groupedFilterLabels.length === 1 && combinationFilters.length === 0) {
    return combineFiltersWithOR(groupedFilters[groupedFilterLabels[0]]);
  }
  return {
    kind: 'conjunction',
    combinator: FilterCombinator.AND,
    filters: Object.values(groupedFilters)
      .map(filters => combineFiltersWithOR(filters))
      .concat(combinationFilters)
  };
}
