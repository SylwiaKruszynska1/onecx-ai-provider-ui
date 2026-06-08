import { createSelector } from '@ngrx/store'
import { createChildSelectors } from '@onecx/ngrx-accelerator'
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors'
import { configurationFeature } from '../../configuration.reducers'
import { initialState } from './configuration-details.reducers'
import { ConfigurationDetailsViewModel } from './configuration-details.viewmodel'

export const configurationDetailsSelectors = createChildSelectors(configurationFeature.selectDetails, initialState)

export const selectDetailsState = createSelector(
  configurationDetailsSelectors.selectDetails,
  configurationDetailsSelectors.selectDetailsLoadingIndicator,
  configurationDetailsSelectors.selectDetailsLoaded,
  (details, detailsLoadingIndicator, detailsLoaded) => ({
    details,
    detailsLoadingIndicator,
    detailsLoaded
  })
)

export const selectProvidersState = createSelector(
  configurationDetailsSelectors.selectProviders,
  configurationDetailsSelectors.selectProvidersLoadingIndicator,
  configurationDetailsSelectors.selectProvidersLoaded,
  (Providers, ProvidersLoadingIndicator, ProvidersLoaded) => ({
    Providers,
    ProvidersLoadingIndicator,
    ProvidersLoaded
  })
)

export const selectMcpServersState = createSelector(
  configurationDetailsSelectors.selectMcpServers,
  configurationDetailsSelectors.selectMcpServersLoadingIndicator,
  configurationDetailsSelectors.selectMcpServersLoaded,
  (MCPServers, MCPServersLoadingIndicator, MCPServersLoaded) => ({
    MCPServers,
    MCPServersLoadingIndicator,
    MCPServersLoaded
  })
)

export const selectConfigurationDetailsViewModel = createSelector(
  selectDetailsState,
  selectProvidersState,
  selectMcpServersState,
  selectBackNavigationPossible,
  configurationDetailsSelectors.selectEditMode,
  configurationDetailsSelectors.selectIsSubmitting,
  (
    detailsState,
    providersState,
    mcpServersState,
    backNavigationPossible,
    editMode,
    isSubmitting
  ): ConfigurationDetailsViewModel => ({
    ...detailsState,
    ...providersState,
    ...mcpServersState,
    backNavigationPossible,
    editMode,
    isSubmitting
  })
)
