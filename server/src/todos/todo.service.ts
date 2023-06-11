import { UserDto } from '@src/users/user.dto'
import { userRepository } from '@src/users/user.repository'
import { expressResponse } from '@src/utils/response'
import { isFail } from 'huelgo-monad'
import { TodoDto } from './todo.dto'
import { todoRepository } from './todo.repository'

type UserTodos = {
  user: UserDto
  todo: TodoDto
}

type UpdateTodos = {
  todo: TodoDto
  changes: Partial<Omit<TodoDto, 'id' | 'user_id'>>
}

class TodoService {
  async update({ todo, changes }: UpdateTodos) {
    const changesTodo = {
      ...todo,
      ...changes,
    }

    const tryUpdate = await todoRepository.update(changesTodo)
    if (isFail(tryUpdate)) {
      return expressResponse({
        status: 202,
        msg: 'Not Update Todos',
        data: {
          changesTodo,
        },
      })
    }

    return expressResponse({
      status: 200,
      msg: 'done',
    })
  }

  async read({ id }: UserDto) {
    const tryUserValid = await userRepository.retrieveWhere('id', String(id))
    if (isFail(tryUserValid) || tryUserValid.value.length === 0) {
      return expressResponse({
        status: 401,
        msg: 'Not Access',
      })
    }

    const tryTodo = await todoRepository.retrive('user_id', String(id))
    const todoDict = tryTodo.value?.reduce(
      (acc: any, cur: any) => {
        if (cur.is_completed && cur.is_deleted) {
          acc['last_todo'].push(cur)
        } else if (cur.is_deleted) {
          acc['delete_todo'].push(cur)
        } else if (cur.is_completed) {
          acc['is_completed'].push(cur)
        } else {
          acc['live_todo'].push(cur)
        }

        return acc
      },
      {
        live_todo: [],
        complete_todo: [],
        delete_todo: [],
        last_todo: [],
      }
    )

    return expressResponse({
      status: 200,
      msg: 'done',
      data: todoDict,
    })
  }

  async create({ user, todo }: UserTodos) {
    const existsUser = await userRepository.retrieveWhere('id', user?.id ?? 'A')

    // not exists user
    if (isFail(existsUser) || existsUser.value.length === 0) {
      return expressResponse({
        status: 401,
        msg: 'Not Access',
      })
    }

    const tryTodo = await todoRepository.create(String(user.id), {
      title: todo.title,
      description: todo.description,
    })

    return isFail(tryTodo)
      ? expressResponse({
          status: 202,
          msg: 'Invalid todos',
          data: {
            user,
            todo,
          },
        })
      : expressResponse({
          status: 200,
          msg: 'done',
        })
  }
}

export const todoService = new TodoService()
