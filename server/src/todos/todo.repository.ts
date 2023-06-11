import { query } from '@src/configs/db'
import { TodoDto } from './todo.dto'

class TodoRepository {
  async retriveWhere() {}

  async retrive(key: keyof TodoDto, value: string) {
    return await query(
      `
            select 
            *
            from todos
            where ${key} = ?
        `,
      [value]
    )
  }

  async create(userId: string, { title, description }: Pick<TodoDto, 'title' | 'description'>) {
    return await query(
      `
            insert 
            into todos(user_id, title, description)
            values(?,?,?)
        `,
      [userId, title, description]
    )
  }

  /**
   * @todo Refactoring 업데이트 property만 되도록...
   */
  async update({ id, title, description, is_completed, is_deleted }: TodoDto) {
    return await query(
      `
            update todos
            set title = ?, description = ?, is_completed = ?, is_deleted = ? 
            where id = ? 
        `,
      [title, description, String(is_completed ? 1 : 0), String(is_deleted ? 1 : 0), id]
    )
  }
}

export const todoRepository = new TodoRepository()
