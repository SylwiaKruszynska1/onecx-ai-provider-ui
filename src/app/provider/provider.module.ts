import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import { providePortalDialogService } from '@onecx/angular-accelerator'
import { DatePickerModule } from 'primeng/datepicker'
import { SharedModule } from '../shared/shared.module'
import { providePermissionService } from '@onecx/angular-utils'
import { ProviderFeature } from './provider.reducers'
import { routes } from './provider.routes'
import { ProviderDetailsComponent } from './pages/provider-details/provider-details.component'
import { ProviderDetailsEffects } from './pages/provider-details/provider-details.effects'
import { ProviderSearchComponent } from './pages/provider-search/provider-search.component'
import { ProviderSearchEffects } from './pages/provider-search/provider-search.effects'
import { ProviderCreateUpdateComponent } from './pages/provider-search/dialogs/provider-create-update/provider-create-update.component'

@NgModule({
  providers: [providePortalDialogService(), ...providePermissionService()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    LetDirective,
    AngularAcceleratorModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    ProviderCreateUpdateComponent,
    ProviderDetailsComponent,
    ProviderSearchComponent,
    StoreModule.forFeature(ProviderFeature),
    EffectsModule.forFeature([ProviderDetailsEffects, ProviderSearchEffects]),
    TranslateModule
  ]
})
export class ProviderModule {}
