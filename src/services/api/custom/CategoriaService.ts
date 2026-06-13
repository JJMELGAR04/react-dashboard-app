import type Categoria from '@/models/api/entities/Categoria'
import { appSettings } from '@/AppSettings'
import Service from '@/services/core/Service'

export default class CategoriaService extends Service<Categoria> {
  constructor() {
    super({
      origin: appSettings.apiService,
      endpoint: '/finanzas/categorias',
    })
  }
}
