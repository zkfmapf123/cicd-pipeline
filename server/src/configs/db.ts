import { Logger } from '@src/utils/Logger'
import dotenv from 'dotenv'
import { failed, passed, Try } from 'huelgo-monad'
import _ from 'lodash'
import mysql from 'mysql2/promise'

dotenv.config()

const dbConn = async (): Promise<mysql.Pool> => {
  return mysql.createPool({
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 5000,
    connectionLimit: 30,
    waitForConnections: true,
  })
}

export async function query<T>(q: string, params?: string[]): Promise<Try<undefined, T[]>> {
  let co: mysql.PoolConnection | undefined = undefined

  try {
    co = await (await dbConn()).getConnection()

    const [result] = await co.query(q, params ?? null)

    if (_.isArray(result) && result.length > 0) {
      if (result.length === 1) {
        const [obj] = result

        // model
        return <Try<undefined, T[]>>passed([obj])
      }
    }

    // models
    return <Try<undefined, T[]>>passed(result)
  } catch (e) {
    Logger.error(e)
    return failed(undefined)
  } finally {
    co?.release()
  }
}
