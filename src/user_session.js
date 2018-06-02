import { findUserByUuid } from './db'

export default () => {
  return async (ctx, next) => {
    const user = findUserByUuid(ctx.session.user)
    ctx.user = user
    await next()
  }
}
