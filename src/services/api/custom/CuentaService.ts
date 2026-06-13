import type Cuenta from '@/models/api/entities/Cuenta'
import { appSettings } from '@/AppSettings'
import Service from '@/services/core/Service'

export default class CuentaService extends Service<Cuenta> {
  constructor() {
    super({
      origin: appSettings.apiService,
      endpoint: '/finanzas/cuentas',
    })
  }
}
