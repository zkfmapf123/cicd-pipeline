import { query } from '@src/configs/db'
import { UserDto } from './user.dto'

class UserRepository {
  async retrieveWhere(key: keyof UserDto, value: string) {
    return await query<UserDto>(
      `
      select 
      id
      from users
      where ${key} = ?
    `,
      [value]
    )
  }

  async retrieve(userDto: UserDto) {
    throw new Error('must be implentation')
  }

  async update({ name, email, password }: UserDto) {
    return await query<UserDto>(
      `
        insert 
        into users(name, email, password)
        values(?,?,?)
      `,
      [name, email, password]
    )
  }

  async delete(key: keyof UserDto | 'id', value: string) {
    return await query<UserDto>(
      `
        delete 
        from users
        where ${key} = ?
      `,
      [value]
    )
  }
}

export const userRepository = new UserRepository()
