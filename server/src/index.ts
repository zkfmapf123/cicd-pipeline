import express, { Router } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { healthCheckHandler } from './healthCheck/healthCheck.handler'
import { todoHandler } from './todos/todo.handler'
import { userHandler } from './users/user.handler'

class ExpressApp {
  private VERSION = '/v1'
  private app: express.Express

  constructor() {
    this.app = express()
  }

  setMiddleware(): this {
    this.app.use(helmet())
    this.app.use(morgan('common'))
    this.app.use(express.json())
    return this
  }

  setEnv(): this {
    this.app.set('trust proxy', true)
    this.app.set('env', process.env.ENV || 'dev')
    return this
  }

  setRouters(): this {
    const r = Router()
    this.app.use(this.VERSION, healthCheckHandler.getRouter(r))
    this.app.use(this.VERSION, userHandler.getRouter(r))
    this.app.use(this.VERSION, todoHandler.getRouter(r))

    return this
  }

  start() {
    this.app.listen(process.env.PORT, () => {
      console.log(`connect >> port on ${process.env.PORT}`)
    })
  }
}

new ExpressApp().setMiddleware().setEnv().setRouters().start()

// process.on("uncaughtException", )
