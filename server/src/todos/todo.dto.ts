export interface TodoDto {
  id: string
  user_id: string // foreign key
  title: string
  description: string
  is_completed: string
  is_deleted: string
}
