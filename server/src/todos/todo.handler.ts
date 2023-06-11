import { Handlers } from '@src/utils/interface'
import { Request, Response, Router } from 'express'
import { todoService } from './todo.service'

class TodoHandler implements Handlers {
  getRouter(router: Router) {
    router.put('/update', this.update)
    router.post('/read', this.read)
    router.post('/create', this.create)

    return router
  }

  async update(req: Request, res: Response) {
    res.json(await todoService.update(req.body.data))
  }

  async read(req: Request, res: Response) {
    res.json(await todoService.read(req.body.data))
  }

  async create(req: Request, res: Response) {
    res.json(await todoService.create(req.body.data))
  }
}

export const todoHandler = new TodoHandler()
