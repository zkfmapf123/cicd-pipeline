import { Handlers } from '@src/utils/interface'
import { Request, Response, Router } from 'express'
import { userService } from './user.service'

class UserHandler implements Handlers {
  getRouter(router: Router): Router {
    router.post('/register', this.register)
    router.delete('/delete', this.delete)
    return router
  }

  async register(req: Request, res: Response) {
    res.json(await userService.register(req.body.data))
  }

  async delete(req: Request, res: Response) {
    res.json(await userService.delete(req.body.data))
  }
}

export const userHandler = new UserHandler()
