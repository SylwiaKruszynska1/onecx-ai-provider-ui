import {
  DataTableColumn,
  DiagramComponentState,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState
} from '@onecx/angular-accelerator'
import { MCPServer } from 'src/app/shared/generated'
import { MCPServerSearchCriteria } from './mcpserver-search.parameters'

export interface MCPServerSearchState {
  columns: DataTableColumn[]
  results: MCPServer[]
  chartVisible: boolean
  resultComponentState: InteractiveDataViewComponentState | null
  searchHeaderComponentState: SearchHeaderComponentState | null
  diagramComponentState: DiagramComponentState | null
  searchLoadingIndicator: boolean
  criteria: MCPServerSearchCriteria
  searchExecuted: boolean
  healthStatus?: Record<string, string>
}
