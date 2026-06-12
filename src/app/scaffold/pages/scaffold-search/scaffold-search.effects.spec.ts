import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { provideMockStore } from '@ngrx/store/testing'
import { providePortalMessageServiceMock } from '@onecx/angular-integration-interface/mocks'
import { ExportDataService, PortalDialogService } from '@onecx/angular-accelerator'
import { ReplaySubject, of, throwError } from 'rxjs'
import { ScaffoldService } from 'src/app/shared/generated'
import { selectUrl } from 'src/app/shared/selectors/router.selectors'
import { ScaffoldSearchActions } from './scaffold-search.actions'
import { ScaffoldSearchEffects } from './scaffold-search.effects'
import { ScaffoldSearchCriteria } from './scaffold-search.parameters'
import { scaffoldSearchSelectors, selectScaffoldSearchViewModel } from './scaffold-search.selectors'
import { ScaffoldSearchViewModel } from './scaffold-search.viewmodel'

describe('ScaffoldSearchEffects', () => {
  const mockActivatedRoute = { snapshot: { data: {} } }
  let actions$: ReplaySubject<unknown>
  let effects: ScaffoldSearchEffects
  let router: jest.Mocked<Router>
  let scaffoldService: jest.Mocked<ScaffoldService>
  let portalDialogService: jest.Mocked<PortalDialogService>
  let exportDataService: jest.Mocked<ExportDataService>

  const mockCriteria: ScaffoldSearchCriteria = { name: 'test-name' }

  beforeEach(async () => {
    actions$ = new ReplaySubject(1)

    scaffoldService = {
      findScaffoldByCriteria: jest.fn(),
      createScaffold: jest.fn(),
      updateScaffoldById: jest.fn(),
      deleteScaffoldById: jest.fn()
    } as unknown as jest.Mocked<ScaffoldService>

    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn().mockImplementation((url: string) => ({
        queryParams: {},
        fragment: null,
        toString: () => url.split('?')[0]
      })),
      events: of()
    } as unknown as jest.Mocked<Router>

    portalDialogService = {
      openDialog: jest.fn()
    } as unknown as jest.Mocked<PortalDialogService>

    exportDataService = { exportCsv: jest.fn() } as unknown as jest.Mocked<ExportDataService>

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        ScaffoldSearchEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: scaffoldSearchSelectors.selectCriteria, value: mockCriteria },
            { selector: selectUrl, value: '/scaffold' },
            { selector: scaffoldSearchSelectors.selectResults, value: [] },
            { selector: selectScaffoldSearchViewModel, value: {} as ScaffoldSearchViewModel }
          ]
        }),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: router },
        { provide: ScaffoldService, useValue: scaffoldService },
        { provide: PortalDialogService, useValue: portalDialogService },
        { provide: ExportDataService, useValue: exportDataService },
        providePortalMessageServiceMock()
      ]
    }).compileComponents()

    effects = TestBed.inject(ScaffoldSearchEffects)
  })

  it('should be created', () => {
    expect(effects).toBeTruthy()
  })

  describe('searchByUrl$', () => {
    it('should dispatch scaffoldSearchResultsReceived on success', (done) => {
      const mockResults = {
        stream: [{ id: '1', name: 'Test' }],
        totalElements: 1
      }

      scaffoldService.findScaffoldByCriteria.mockReturnValue(of(mockResults) as any)

      effects.performSearch({ name: 'test' }).subscribe((action) => {
        expect(action).toEqual(
          ScaffoldSearchActions.scaffoldSearchResultsReceived({
            results: mockResults.stream,
            totalNumberOfResults: 1
          })
        )
        done()
      })
    })

    it('should dispatch scaffoldSearchResultsLoadingFailed on error', (done) => {
      scaffoldService.findScaffoldByCriteria.mockReturnValue(
        throwError(() => new Error('API error')) as any
      )

      effects.performSearch({ name: 'test' }).subscribe((action) => {
        expect(action).toEqual(
          ScaffoldSearchActions.scaffoldSearchResultsLoadingFailed({
            error: expect.any(Error)
          })
        )
        done()
      })
    })
  })
})
