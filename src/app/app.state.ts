import { SerializedRouterStateSnapshot, RouterReducerState } from '@ngrx/router-store'
import { OneCxState } from '@onecx/ngrx-accelerator'

export interface State {
  router: RouterReducerState<SerializedRouterStateSnapshot>
  onecx: OneCxState
}
