import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { Store } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { AlwaysGrantPermissionChecker, HAS_PERMISSION_CHECKER, providePermissionService } from '@onecx/angular-utils'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { provideUserServiceMock } from '@onecx/angular-integration-interface/mocks'
import { ExportDataService } from '@onecx/angular-accelerator'
import { ScaffoldSearchComponent } from './scaffold-search.component'
import { selectScaffoldSearchViewModel } from './scaffold-search.selectors'
import { scaffoldSearchColumns } from './scaffold-search.columns'
import { ScaffoldSearchViewModel } from './scaffold-search.viewmodel'
import { ScaffoldSearchActions } from './scaffold-search.actions'

describe('ScaffoldSearchComponent', () => {
  let component: ScaffoldSearchComponent
  let fixture: ComponentFixture<ScaffoldSearchComponent>
  let store: MockStore<Store>

  const mockActivatedRoute = { snapshot: { data: {} } }

  const baseViewModel: ScaffoldSearchViewModel = {
    columns: scaffoldSearchColumns,
    searchCriteria: {},
    results: [],
    chartVisible: false,
    viewMode: 'basic',
    displayedColumns: []
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScaffoldSearchComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        LetDirective,
        AngularAcceleratorModule,
        TranslateTestingModule.withTranslations({})
      ],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: HAS_PERMISSION_CHECKER, useClass: AlwaysGrantPermissionChecker },
        { provide: ExportDataService, useValue: { exportCsv: jest.fn() } },
        provideUserServiceMock(),
        ...providePermissionService(),
        provideMockStore({
          selectors: [{ selector: selectScaffoldSearchViewModel, value: baseViewModel }]
        })
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ScaffoldSearchComponent)
    component = fixture.componentInstance
    store = TestBed.inject<MockStore<Store>>(MockStore)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should dispatch createScaffoldButtonClicked on create()', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    component.create()
    expect(dispatchSpy).toHaveBeenCalledWith(ScaffoldSearchActions.createScaffoldButtonClicked())
  })

  it('should dispatch resetButtonClicked on resetSearch()', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    component.resetSearch()
    expect(dispatchSpy).toHaveBeenCalledWith(ScaffoldSearchActions.resetButtonClicked())
  })
})
