import { expressResponse } from '@src/utils/response'
import { isFail } from 'huelgo-monad'
import { UserDto } from './user.dto'
import { userRepository } from './user.repository'

class UserService {
  async register(userDto: UserDto) {
    const { name, email } = userDto
    const validChecks = await Promise.all([this.isValidUserProperty('email', email), this.isValidUserProperty('name', name)])

    // not matched
    if (validChecks.some((it) => !it)) {
      return expressResponse({
        status: 202,
        msg: 'Not Matched name or email',
        data: {
          name,
          email,
        },
      })
    }

    // regiser user info
    const isUpdate = await userRepository.update(userDto)
    if (isFail(isUpdate)) {
      return expressResponse({
        status: 400,
        msg: 'not register user',
        data: {
          user: userDto,
          reason: isUpdate.value,
        },
      })
    }

    return expressResponse({
      status: 200,
      msg: 'done',
    })
  }

  async delete({ id }: UserDto) {
    const isUpdate = await userRepository.delete('id', id as string)
    if (isFail(isUpdate)) {
      return expressResponse({
        status: 400,
        msg: 'not delete user',
        data: {
          user_id: id,
          reason: isUpdate.value,
        },
      })
    }

    return expressResponse({
      status: 200,
      msg: 'delete user',
    })
  }

  private async isValidUserProperty(key: keyof Pick<UserDto, 'email' | 'name'>, value: string) {
    const property = await userRepository.retrieveWhere(key, value)
    if (!property.value || property.value.length === 0) {
      return true
    }

    return false
  }
}

export const userService = new UserService()
