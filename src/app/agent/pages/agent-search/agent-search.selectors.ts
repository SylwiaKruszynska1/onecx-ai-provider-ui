import { createSelector } from '@ngrx/store'

import { RowListGridData } from '@onecx/angular-accelerator'
import { createChildSelectors } from '@onecx/ngrx-accelerator'

import { Agent } from 'src/app/shared/generated'
import { agentFeature } from '../../agent.reducers'
import { initialState } from './agent-search.reducers'
import { AgentSearchViewModel } from './agent-search.viewmodel'

export const agentSearchSelectors = createChildSelectors(agentFeature.selectSearch, initialState)

export const selectResults = createSelector(
  agentSearchSelectors.selectResults,
  (results: Agent[]): RowListGridData[] => {
    return results.map((item, index) => ({
      id: item.id ?? `agent-${index}`,
      imagePath: '',
      ...item
      // ACTION S7: Create a mapping of the items and their corresponding translation keys
    }))
  }
)

const selectSearchCriteria = createSelector(
  agentSearchSelectors.selectColumns,
  agentSearchSelectors.selectCriteria,
  (columns, searchCriteria) => ({ columns, searchCriteria })
)

const selectComponentStates = createSelector(
  agentSearchSelectors.selectResultComponentState,
  agentSearchSelectors.selectSearchHeaderComponentState,
  agentSearchSelectors.selectDiagramComponentState,
  (resultComponentState, searchHeaderComponentState, diagramComponentState) => ({
    resultComponentState,
    searchHeaderComponentState,
    diagramComponentState
  })
)

const selectUiState = createSelector(
  agentSearchSelectors.selectChartVisible,
  agentSearchSelectors.selectSearchLoadingIndicator,
  agentSearchSelectors.selectSearchExecuted,
  (chartVisible, searchLoadingIndicator, searchExecuted) => ({
    chartVisible,
    searchLoadingIndicator,
    searchExecuted
  })
)

export const selectAgentSearchViewModel = createSelector(
  selectSearchCriteria,
  selectResults,
  selectComponentStates,
  selectUiState,
  (searchCriteria, results, componentStates, uiState): AgentSearchViewModel => ({
    // NOSONAR - NgRx createSelector projector requires one parameter per input selector.
    ...searchCriteria,
    results,
    ...componentStates,
    ...uiState
  })
)
