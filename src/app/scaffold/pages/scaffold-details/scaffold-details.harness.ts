import { ComponentHarness } from '@angular/cdk/testing'
import { PageHeaderHarness } from '@onecx/angular-accelerator/testing'

export class ScaffoldDetailsHarness extends ComponentHarness {
  static hostSelector = 'app-scaffold-details'

  getHeader = this.locatorFor(PageHeaderHarness)
}
