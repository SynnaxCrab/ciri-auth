import { findUserByUuid } from './db/user'

export default () => {
  return async (ctx, next) => {
    if (ctx.session.user) {
      const user = await findUserByUuid(ctx.session.user)
      ctx.user = user
    }
    await next()
  }
}
