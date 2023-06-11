interface ResponseParams<T> {
  status: number
  msg: string
  data?: T
}
export const expressResponse = <T>({ status, msg, data }: ResponseParams<T>): ResponseParams<T> => ({
  status,
  msg,
  data,
})
