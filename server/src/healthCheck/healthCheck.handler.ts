import { Handlers } from '@src/utils/interface'
import { Request, Response, Router } from 'express'

class HealthCheckHandler implements Handlers {
  getRouter(router: Router): Router {
    router.get('/healthCheck', this.healthCheck)
    return router
  }

  async healthCheck(req: Request, res: Response) {
    res.status(200).json({
      msg: 'done',
    })
  }
}

export const healthCheckHandler = new HealthCheckHandler()
