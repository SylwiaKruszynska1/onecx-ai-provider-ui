import { agentDetailsActions } from './agent-details.actions'
import { agentDetailsReducer, initialState } from './agent-details.reducers'

describe('agentDetailsReducer', () => {
  describe('details state updates', () => {
    it('should set details on agentDetailsReceived', () => {
      const details = { id: '1' }
      const action = agentDetailsActions.agentDetailsReceived({
        details
      })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        details,
        detailsLoaded: true,
        detailsLoadingIndicator: false
      })
    })

    it('should handle agentDetailsLoadingFailed action', () => {
      const action = agentDetailsActions.agentDetailsLoadingFailed({
        error: null
      })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        details: undefined,
        detailsLoaded: false,
        detailsLoadingIndicator: false
      })
    })

    it('should handle navigatedToDetailsPage action', () => {
      const action = agentDetailsActions.navigatedToDetailsPage({ id: '1' })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState
      })
    })
  })

  describe('providers state updates', () => {
    it('should set providers on agentProvidersReceived', () => {
      const providers = [{ id: '1', name: 'Provider A' }] as any
      const action = agentDetailsActions.agentProvidersReceived({ providers })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        providers,
        providersLoaded: true,
        providersLoadingIndicator: false
      })
    })

    it('should reset providers on agentProvidersLoadingFailed', () => {
      const action = agentDetailsActions.agentProvidersLoadingFailed({ error: null })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        providers: [],
        providersLoaded: false,
        providersLoadingIndicator: false
      })
    })
  })

  describe('models state updates', () => {
    it('should set models on agentModelsReceived', () => {
      const models = [{ id: '1', name: 'Model A' }] as any
      const action = agentDetailsActions.agentModelsReceived({ models })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        models,
        modelsLoaded: true,
        modelsLoadingIndicator: false
      })
    })

    it('should reset models on agentModelsLoadingFailed', () => {
      const action = agentDetailsActions.agentModelsLoadingFailed({ error: null })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        models: [],
        modelsLoaded: false,
        modelsLoadingIndicator: false
      })
    })
  })

  describe('scaffolds state updates', () => {
    it('should set scaffolds on agentScaffoldsReceived', () => {
      const scaffolds = [{ id: '1', name: 'Scaffold A' }] as any
      const action = agentDetailsActions.agentScaffoldsReceived({ scaffolds })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        scaffolds,
        scaffoldsLoaded: true,
        scaffoldsLoadingIndicator: false
      })
    })

    it('should reset scaffolds on agentScaffoldsLoadingFailed', () => {
      const action = agentDetailsActions.agentScaffoldsLoadingFailed({ error: null })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        scaffolds: [],
        scaffoldsLoaded: false,
        scaffoldsLoadingIndicator: false
      })
    })
  })

  describe('tools state updates', () => {
    it('should set tools on agentToolsReceived', () => {
      const tools = [{ id: '1', name: 'Tool A' }] as any
      const action = agentDetailsActions.agentToolsReceived({ tools })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        tools,
        toolsLoaded: true,
        toolsLoadingIndicator: false
      })
    })

    it('should reset tools on agentToolsLoadingFailed', () => {
      const action = agentDetailsActions.agentToolsLoadingFailed({ error: null })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        tools: [],
        toolsLoaded: false,
        toolsLoadingIndicator: false
      })
    })
  })

  describe('groups state updates', () => {
    it('should set groups on agentGroupsReceived', () => {
      const groups = [{ id: '1', name: 'Group A' }] as any
      const action = agentDetailsActions.agentGroupsReceived({ groups })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        groups,
        groupsLoaded: true,
        groupsLoadingIndicator: false
      })
    })

    it('should reset groups on agentGroupsLoadingFailed', () => {
      const action = agentDetailsActions.agentGroupsLoadingFailed({ error: null })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        groups: [],
        groupsLoaded: false,
        groupsLoadingIndicator: false
      })
    })

    it('should add a new group on createGroupInPlaceSucceeded', () => {
      const group = { id: '2', name: 'New group' } as any
      const newState = {
        ...initialState,
        groups: [{ id: '1', name: 'Existing group' }] as any
      }
      const action = agentDetailsActions.createGroupInPlaceSucceeded({ group })
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState.groups).toEqual([...newState.groups, group])
    })

    it('should not duplicate an existing group on createGroupInPlaceSucceeded', () => {
      const group = { id: '1', name: 'Existing group' } as any
      const newState = {
        ...initialState,
        groups: [{ id: '1', name: 'Existing group' }] as any
      }
      const action = agentDetailsActions.createGroupInPlaceSucceeded({ group })
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState.groups).toEqual(newState.groups)
    })
  })

  describe('edit mode and submission state', () => {
    it('should set editMode true on editButtonClicked', () => {
      const action = agentDetailsActions.editButtonClicked()
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        editMode: true
      })
    })

    it('should set isSubmitting true on saveButtonClicked', () => {
      const details = { id: '1' }
      const action = agentDetailsActions.saveButtonClicked({ details })
      const nextState = agentDetailsReducer(initialState, action)

      expect(nextState).toEqual({
        ...initialState,
        isSubmitting: true
      })
    })

    it('should set editMode false on cancelEditConfirmClicked', () => {
      const newState = { ...initialState, editMode: true }
      const action = agentDetailsActions.cancelEditConfirmClicked()
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState).toEqual({
        ...initialState,
        editMode: false
      })
    })

    it('should set editMode false on cancelEditNotDirty', () => {
      const newState = { ...initialState, editMode: true }
      const action = agentDetailsActions.cancelEditNotDirty()
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState).toEqual({
        ...initialState,
        editMode: false
      })
    })

    it('should set editMode false on updateAgentCancelled', () => {
      const newState = { ...initialState, editMode: true }
      const action = agentDetailsActions.updateAgentCancelled()
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState).toEqual({
        ...initialState,
        editMode: false
      })
    })

    it('should update details and set editMode false on updateAgentSucceeded', () => {
      const details = { id: '1' }
      const newState = { ...initialState, editMode: true, isSubmitting: true }
      const action = agentDetailsActions.updateAgentSucceeded({ details })
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState).toEqual({
        ...initialState,
        details,
        editMode: false,
        isSubmitting: false
      })
    })

    it('should handle updateAgentFailed action', () => {
      const newState = { ...initialState, isSubmitting: true }
      const action = agentDetailsActions.updateAgentFailed({
        error: null
      })
      const nextState = agentDetailsReducer(newState, action)

      expect(nextState).toEqual({
        ...initialState,
        isSubmitting: false
      })
    })
  })
})
