import { environment } from 'src/environments/environment'
import { APIConfiguration } from '../generated/configuration'
import { PortalApiConfiguration } from '@onecx/angular-utils'

export function apiConfigProvider() {
  return new PortalApiConfiguration(APIConfiguration, environment.apiPrefix)
}
