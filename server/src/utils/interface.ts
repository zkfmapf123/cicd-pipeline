import { Router } from 'express'

export interface Handlers {
  getRouter(router: Router): Router
}
