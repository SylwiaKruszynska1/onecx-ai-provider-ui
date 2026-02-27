import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'
import { AngularAcceleratorModule, providePortalDialogService } from '@onecx/angular-accelerator'
import { DatePickerModule } from 'primeng/datepicker'
import { TooltipModule } from 'primeng/tooltip'
import { MultiSelectModule } from 'primeng/multiselect'
import { SharedModule } from '../shared/shared.module'
import { PortalPageComponent } from '@onecx/angular-utils'
import { mcpserverFeature } from './mcpserver.reducers'
import { routes } from './mcpserver.routes'
import { MCPServerDetailsComponent } from './pages/mcpserver-details/mcpserver-details.component'
import { MCPServerSearchComponent } from './pages/mcpserver-search/mcpserver-search.component'
import { MCPServerDetailsEffects } from './pages/mcpserver-details/mcpserver-details.effects'
import { MCPServerSearchEffects } from './pages/mcpserver-search/mcpserver-search.effects'
import { provideTranslationConnectionService } from '@onecx/angular-utils'
import { provideStandaloneProviders, StandaloneShellModule } from '@onecx/angular-standalone-shell'

@NgModule({
  providers: [providePortalDialogService(), provideTranslationConnectionService(), provideStandaloneProviders()],
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
    TooltipModule,
    MultiSelectModule,
    MCPServerDetailsComponent,
    MCPServerSearchComponent,
    PortalPageComponent,
    StoreModule.forFeature(mcpserverFeature),
    EffectsModule.forFeature([MCPServerDetailsEffects, MCPServerSearchEffects]),
    TranslateModule,
    StandaloneShellModule
  ]
})
export class MCPServerModule {}
