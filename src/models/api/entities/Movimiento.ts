import type Cuenta from './Cuenta'
import type Categoria from './Categoria'

export default interface Movimiento {
  id?: number
  monto: number
  monedaOriginal: string
  tasaCambio?: number
  fecha: string
  descripcion?: string
  cuenta?: Cuenta
  categoria?: Categoria
}
