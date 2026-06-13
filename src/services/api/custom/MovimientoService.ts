import type Movimiento from '@/models/api/entities/Movimiento'
import { appSettings } from '@/AppSettings'
import Service from '@/services/core/Service'

export default class MovimientoService extends Service<Movimiento> {
  constructor() {
    super({
      origin: appSettings.apiService,
      endpoint: '/finanzas/movimientos',
    })
  }
}
