import { ComponentHarness } from '@angular/cdk/testing'
import { InteractiveDataViewHarness, SearchHeaderHarness } from '@onecx/angular-accelerator/testing'

export class ScaffoldSearchHarness extends ComponentHarness {
  static hostSelector = 'app-scaffold-search'

  getHeader = this.locatorFor(SearchHeaderHarness)
  getSearchResults = this.locatorFor(InteractiveDataViewHarness)
}
