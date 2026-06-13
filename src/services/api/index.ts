import Role from '@/models/api/entities/Role'
import Permissions from '@/models/api/entities/Permissions'
import Service from '../core/Service'
import UserService from './custom/UserService'
import CuentaService from './custom/CuentaService'
import MovimientoService from './custom/MovimientoService'
import CategoriaService from './custom/CategoriaService'

//custom
export const userService = new UserService()
export const cuentaService = new CuentaService()
export const movimientoService = new MovimientoService()
export const categoriaService = new CategoriaService()

//core
export const roleService = new Service<Role>({ endpoint: 'roles' })
export const permissionService = new Service<Permissions>({
  endpoint: 'permissions',
})
