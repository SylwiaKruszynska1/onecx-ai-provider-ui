import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, Router } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { provideMockActions } from '@ngrx/effects/testing'
import { Action, Store, StoreModule } from '@ngrx/store'
import { routerNavigatedAction } from '@ngrx/router-store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { of, ReplaySubject, throwError } from 'rxjs'
import { take } from 'rxjs/operators'

import { provideUserServiceMock } from '@onecx/angular-integration-interface/mocks'
import { AlwaysGrantPermissionChecker, HAS_PERMISSION_CHECKER, providePermissionService } from '@onecx/angular-utils'
import {
  AngularAcceleratorModule,
  ColumnType,
  ExportDataService,
  PortalDialogService
} from '@onecx/angular-accelerator'
import { PortalMessageService } from '@onecx/angular-integration-interface'

import { ProviderService } from 'src/app/shared/generated'
import { selectUrl } from 'src/app/shared/selectors/router.selectors'
import { ProviderSearchActions } from './provider-search.actions'
import { ProviderSearchColumns } from './provider-search.columns'
import { ProviderSearchEffects } from './provider-search.effects'
import { initialState } from './provider-search.reducers'
import { ProviderSearchSelectors, selectProviderSearchViewModel } from './provider-search.selectors'
import { ProviderSearchViewModel } from './provider-search.viewmodel'
import { Actions } from '@ngrx/effects'

jest.mock('@onecx/ngrx-accelerator', () => {
  const actual = jest.requireActual('@onecx/ngrx-accelerator')
  return {
    ...actual,
    filterForNavigatedTo: () => (source: unknown) => source,
    filterOutQueryParamsHaveNotChanged: () => (source: unknown) => source,
    filterOutOnlyQueryParamsChanged: () => (source: unknown) => source
  }
})

describe('ProviderSearchEffects', () => {
  let store: MockStore<Store>
  let actions$: ReplaySubject<Action>
  let effects: ProviderSearchEffects
  let router: jest.Mocked<Router>
  let route: ActivatedRoute
  let providerService: jest.Mocked<ProviderService>
  let portalDialogService: jest.Mocked<PortalDialogService>
  let messageService: jest.Mocked<PortalMessageService>
  let exportDataService: jest.Mocked<ExportDataService>

  const baseProviderSearchViewModel: ProviderSearchViewModel = {
    columns: ProviderSearchColumns,
    searchCriteria: {
      name: undefined,
      llmUrl: undefined,
      description: undefined,
      id: undefined
    },
    results: [],
    displayedColumns: [],
    viewMode: 'basic',
    chartVisible: false
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    actions$ = new ReplaySubject(1)

    providerService = {
      findProviderBySearchCriteria: jest.fn(),
      updateProvider: jest.fn(),
      createProvider: jest.fn(),
      deleteProvider: jest.fn()
    } as unknown as jest.Mocked<ProviderService>

    router = {
      navigate: jest.fn().mockResolvedValue(true),
      parseUrl: jest.fn(),
      events: of()
    } as unknown as jest.Mocked<Router>

    route = {
      queryParams: of({}),
      snapshot: { queryParams: {} }
    } as unknown as ActivatedRoute

    portalDialogService = {
      openDialog: jest.fn()
    } as unknown as jest.Mocked<PortalDialogService>

    messageService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<PortalMessageService>

    exportDataService = {
      exportCsv: jest.fn()
    } as unknown as jest.Mocked<ExportDataService>

    await TestBed.configureTestingModule({
      imports: [
        AngularAcceleratorModule,
        LetDirective,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations({
          en: require('./src/assets/i18n/en.json'),
          de: require('./src/assets/i18n/de.json')
        }).withDefaultLanguage('en'),
        NoopAnimationsModule
      ],
      providers: [
        ...providePermissionService(),
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: { Provider: { search: initialState } }
        }),
        FormBuilder,
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: ProviderService, useValue: providerService },
        { provide: PortalDialogService, useValue: portalDialogService },
        { provide: PortalMessageService, useValue: messageService },
        { provide: ExportDataService, useValue: exportDataService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideUserServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useClass: AlwaysGrantPermissionChecker
        }
      ]
    }).compileComponents()

    const translateService = TestBed.inject(TranslateService)
    translateService.use('en')

    store = TestBed.inject(MockStore)
    effects = new ProviderSearchEffects(
      portalDialogService,
      actions$ as unknown as Actions,
      route,
      providerService,
      router,
      store,
      messageService,
      exportDataService
    )
    store.overrideSelector(selectProviderSearchViewModel, baseProviderSearchViewModel)
    store.refreshState()
  })

  describe('search and URL synchronization', () => {
    it('should navigate to update the URL when criteria changes', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate')
      store.overrideSelector(ProviderSearchSelectors.selectCriteria, { name: 'provider-1' })
      store.refreshState()
      route.queryParams = of({ different: 'yes' })

      effects.syncParamsToUrl$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith([], {
          relativeTo: route,
          queryParams: { name: 'provider-1' },
          replaceUrl: true,
          onSameUrlNavigation: 'ignore'
        })
        done()
      })

      actions$.next(ProviderSearchActions.searchButtonClicked({ searchCriteria: { name: 'provider-1' } }))
    })

    it('should use the latest criteria from the store when router navigates', (done) => {
      const criteriaFromStore = { name: 'from-store' }
      store.overrideSelector(ProviderSearchSelectors.selectCriteria, criteriaFromStore)
      store.refreshState()

      const performSearchSpy = jest
        .spyOn(effects, 'performSearch')
        .mockReturnValue(of(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null })))

      effects.searchByUrl$.pipe(take(1)).subscribe((action) => {
        expect(performSearchSpy).toHaveBeenCalledWith(criteriaFromStore)
        expect(action).toEqual(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null }))
        done()
      })

      actions$.next({ type: routerNavigatedAction.type })
    })
  })

  describe('performSearch', () => {
    it('should dispatch results received action when performSearch succeeds', (done) => {
      providerService.findProviderBySearchCriteria.mockReturnValue(
        of({ stream: [{ id: '1', name: 'Provider A' }], totalElements: 1 }) as never
      )

      effects
        .performSearch({ name: 'provider-1' })
        .pipe(take(1))
        .subscribe((action) => {
          expect(action).toEqual(
            ProviderSearchActions.providerSearchResultsReceived({
              results: [{ id: '1', name: 'Provider A' }],
              totalNumberOfResults: 1
            })
          )
          done()
        })
    })

    it('should dispatch loading failed action when performSearch errors', (done) => {
      const error = 'Search failed'
      providerService.findProviderBySearchCriteria.mockReturnValueOnce(throwError(() => error) as never)

      effects
        .performSearch({ name: 'provider-1' })
        .pipe(take(1))
        .subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.providerSearchResultsLoadingFailed({ error }))
          done()
        })
    })

    it('should convert Date criteria to ISO strings and default missing values to empty result state', (done) => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z')
      providerService.findProviderBySearchCriteria.mockReturnValue(
        of({ stream: undefined, totalElements: undefined }) as never
      )

      effects
        .performSearch({ name: 'provider-1', createdAt })
        .pipe(take(1))
        .subscribe((action) => {
          expect(providerService.findProviderBySearchCriteria).toHaveBeenCalledWith({
            name: 'provider-1',
            createdAt: '2024-01-01T00:00:00.000Z'
          })
          expect(action).toEqual(
            ProviderSearchActions.providerSearchResultsReceived({
              results: [],
              totalNumberOfResults: 0
            })
          )
          done()
        })
    })
  })

  describe('navigation and refresh actions', () => {
    it('should export the current view model data as CSV', (done) => {
      const viewModel = {
        columns: [],
        searchCriteria: { name: undefined, llmUrl: undefined, description: undefined, id: undefined },
        displayedColumns: [{ id: 'name', columnType: ColumnType.STRING, nameKey: 'COLUMN_KEY' }],
        results: [{ id: '1', name: 'Provider A', imagePath: '' }],
        viewMode: 'basic' as const,
        chartVisible: false
      } as ProviderSearchViewModel
      store.overrideSelector(selectProviderSearchViewModel, viewModel)
      store.refreshState()

      effects.exportData$.pipe(take(1)).subscribe(() => {
        expect(exportDataService.exportCsv).toHaveBeenCalledWith(
          viewModel.displayedColumns,
          viewModel.results,
          'Provider.csv'
        )
        done()
      })

      actions$.next(ProviderSearchActions.exportButtonClicked())
    })

    it('should navigate to the details route when a details action is clicked', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate')
      store.overrideSelector(selectUrl, '/provider?foo=bar')
      store.refreshState()
      ;(router.parseUrl as jest.Mock).mockReturnValue({
        toString: () => '/provider',
        queryParams: {},
        fragment: null
      })

      effects.detailsButtonClicked$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith(['/provider', 'details', 42])
        done()
      })

      actions$.next(ProviderSearchActions.detailsButtonClicked({ id: 42 }))
    })

    it('should refresh the search after create or update succeeds', (done) => {
      const performSearchSpy = jest
        .spyOn(effects, 'performSearch')
        .mockReturnValue(of(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null })))
      store.overrideSelector(ProviderSearchSelectors.selectCriteria, { name: 'provider-1' })
      store.refreshState()

      effects.refreshSearchAfterCreateUpdate$.pipe(take(1)).subscribe((action) => {
        expect(performSearchSpy).toHaveBeenCalledWith({ name: 'provider-1' })
        expect(action).toEqual(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null }))
        done()
      })

      actions$.next(ProviderSearchActions.createProviderSucceeded())
    })

    it('should refresh the search after delete succeeds', (done) => {
      const performSearchSpy = jest
        .spyOn(effects, 'performSearch')
        .mockReturnValue(of(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null })))
      store.overrideSelector(ProviderSearchSelectors.selectCriteria, { name: 'provider-1' })
      store.refreshState()

      effects.refreshSearchAfterDelete$.pipe(take(1)).subscribe((action) => {
        expect(performSearchSpy).toHaveBeenCalledWith({ name: 'provider-1' })
        expect(action).toEqual(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: null }))
        done()
      })

      actions$.next(ProviderSearchActions.deleteProviderSucceeded())
    })
  })

  describe('dialog-driven actions', () => {
    describe('edit flow', () => {
      it('should dispatch updateProviderCancelled when edit dialog result is missing', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(of(undefined as never) as never)

        effects.editButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.updateProviderCancelled())
          done()
        })

        actions$.next(ProviderSearchActions.editProviderButtonClicked({ id: '1' }))
      })

      it('should dispatch updateProviderFailed when edit dialog result has no id', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(
          of({ button: 'primary', result: { name: 'Provider A' } }) as never
        )

        effects.editButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.updateProviderFailed({ error: expect.any(Error) }))
          expect(messageService.error).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.UPDATE.ERROR' })
          done()
        })

        actions$.next(ProviderSearchActions.editProviderButtonClicked({ id: '1' }))
      })

      it('should dispatch updateProviderSucceeded when edit dialog completes', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(
          of({ button: 'primary', result: { id: '1', name: 'Provider A' } }) as never
        )
        providerService.updateProvider.mockReturnValue(of({}) as never)

        effects.editButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.updateProviderSucceeded())
          expect(messageService.success).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.UPDATE.SUCCESS' })
          done()
        })

        actions$.next(ProviderSearchActions.editProviderButtonClicked({ id: '1' }))
      })
    })

    describe('create flow', () => {
      it('should dispatch createProviderCancelled when create dialog result is missing', (done) => {
        portalDialogService.openDialog.mockReturnValue(of(undefined as never) as never)

        effects.createButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.createProviderCancelled())
          done()
        })

        actions$.next(ProviderSearchActions.createProviderButtonClicked())
      })

      it('should dispatch createProviderFailed when create dialog result is missing', (done) => {
        portalDialogService.openDialog.mockReturnValue(of({ button: 'primary', result: undefined }) as never)

        effects.createButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.createProviderFailed({ error: expect.any(Error) }))
          expect(messageService.error).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.CREATE.ERROR' })
          done()
        })

        actions$.next(ProviderSearchActions.createProviderButtonClicked())
      })

      it('should dispatch createProviderSucceeded when create dialog completes', (done) => {
        portalDialogService.openDialog.mockReturnValue(
          of({ button: 'primary', result: { name: 'Provider A' } }) as never
        )
        providerService.createProvider.mockReturnValue(of({}) as never)

        effects.createButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.createProviderSucceeded())
          expect(messageService.success).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.CREATE.SUCCESS' })
          done()
        })

        actions$.next(ProviderSearchActions.createProviderButtonClicked())
      })
    })

    describe('edit details flow', () => {
      it('should dispatch updateProviderSucceeded when edit details action is used', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        providerService.updateProvider.mockReturnValue(of({}) as never)

        effects.editDetailsButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.updateProviderSucceeded())
          expect(messageService.success).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.UPDATE.SUCCESS' })
          done()
        })

        actions$.next(ProviderSearchActions.editProviderDetailsButtonClicked({ id: '1' }))
      })

      it('should use an empty id when edit-details item has no id', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: undefined, name: 'Provider A' }])
        store.refreshState()
        providerService.updateProvider.mockReturnValue(of({}) as never)

        effects.editDetailsButtonClicked$.pipe(take(1)).subscribe(() => {
          expect(providerService.updateProvider).toHaveBeenCalledWith(
            '',
            expect.objectContaining({ name: 'Provider A' })
          )
          done()
        })

        actions$.next(ProviderSearchActions.editProviderDetailsButtonClicked({ id: undefined as never }))
      })

      it('should dispatch updateProviderFailed when edit details result is missing', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [])
        store.refreshState()

        effects.editDetailsButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.updateProviderFailed({ error: expect.any(Error) }))
          expect(messageService.error).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_CREATE_UPDATE.UPDATE.ERROR' })
          done()
        })

        actions$.next(ProviderSearchActions.editProviderDetailsButtonClicked({ id: '1' }))
      })
    })

    describe('delete flow', () => {
      it('should dispatch deleteProviderFailed when delete item cannot be found', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(of({ button: 'primary' }) as never)

        effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.deleteProviderFailed({ error: expect.any(Error) }))
          expect(messageService.error).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_DELETE.ERROR' })
          done()
        })

        actions$.next(ProviderSearchActions.deleteProviderButtonClicked({ id: '1' }))
      })

      it('should dispatch deleteProviderCancelled when delete is cancelled', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(of({ button: 'secondary' }) as never)

        effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.deleteProviderCancelled())
          done()
        })

        actions$.next(ProviderSearchActions.deleteProviderButtonClicked({ id: '1' }))
      })

      it('should dispatch deleteProviderSucceeded when delete dialog completes', (done) => {
        store.overrideSelector(ProviderSearchSelectors.selectResults, [{ id: '1', name: 'Provider A' }])
        store.refreshState()
        portalDialogService.openDialog.mockReturnValue(of({ button: 'primary' }) as never)
        providerService.deleteProvider.mockReturnValue(of({}) as never)

        effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(ProviderSearchActions.deleteProviderSucceeded())
          expect(messageService.success).toHaveBeenCalledWith({ summaryKey: 'PROVIDER_DELETE.SUCCESS' })
          done()
        })

        actions$.next(ProviderSearchActions.deleteProviderButtonClicked({ id: '1' }))
      })
    })
  })

  describe('chart visibility and errors', () => {
    it('should rehydrate chart visibility from local storage', (done) => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('true')

      effects.rehydrateChartVisibility$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(ProviderSearchActions.chartVisibilityRehydrated({ visible: true }))
        done()
      })

      actions$.next({ type: routerNavigatedAction.type })
    })

    it('should persist chart visibility when toggled', (done) => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      store.overrideSelector(ProviderSearchSelectors.selectChartVisible, true)
      store.refreshState()

      effects.saveChartVisibility$.pipe(take(1)).subscribe(() => {
        expect(setItemSpy).toHaveBeenCalledWith('ProviderChartVisibility', 'true')
        done()
      })

      actions$.next(ProviderSearchActions.chartVisibilityToggled())
    })

    it('should display an error message when search results loading fails', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalledWith({
          summaryKey: 'PROVIDER_SEARCH.ERROR_MESSAGES.SEARCH_RESULTS_LOADING_FAILED'
        })
        done()
      })

      actions$.next(ProviderSearchActions.providerSearchResultsLoadingFailed({ error: 'Search failed' }))
    })
  })
})
