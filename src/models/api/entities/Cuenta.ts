export default interface Cuenta {
  id?: number
  alias: string
  moneda: string
  saldoBase: number
  tipo: string
  usuario?: {
    id: number
    username: string
  }
}
