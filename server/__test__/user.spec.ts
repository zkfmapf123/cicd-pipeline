import fs from 'fs'
import { isPass, passed } from 'huelgo-monad'
import { query } from '../src/configs/db'

jest.mock('../src/configs/db', () => {
  return {
    query: jest.fn((q: string, params: string[]) => {
      const users = JSON.parse(fs.readFileSync(process.cwd() + '/__test__/users.json', 'utf-8'))
      const [userNameList, userPropertyList] = [Object.keys(users), Object.values(users)]

      if (q.includes('select')) {
        if (params?.length === 0) {
          return passed(userPropertyList)
        } else {
          return passed(users[params[0]] ?? [])
        }
      }

      return passed([])
    }),
  }
})

describe('user test', () => {
  beforeEach(() => {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('user spec test only users', async () => {
    const users = await query(
      `
          select 
          *
          from users
        `,
      []
    )

    expect(isPass(users)).toBe(true)
    expect(users.value).toMatchObject([
      {
        id: 1,
        name: 'leedonggyu',
        email: 'zkfmapf123@naver.com',
        password: '1234',
      },
      { id: 2, name: 'aaaa', email: 'aaaa@naver.com', password: '123' },
    ])
  })

  it('user spec test is exits', async () => {
    const user = await query(
      `
            select 
            *
            from users
            where name = ?
        `,
      ['leedonggyu']
    )

    expect(isPass(user)).toBe(true)
    expect(user.value).toMatchObject({
      id: 1,
      name: 'leedonggyu',
      email: 'zkfmapf123@naver.com',
      password: '1234',
    })
  })

  it('user spec test', async () => {
    const user = await query(
      `
        select 
        *
        from users
        where name = ?
      `,
      ['limjeahyock']
    )

    expect(isPass(user)).toBe(true)
    expect(user.value).toMatchObject([])
  })
})
