import jwt from 'jsonwebtoken'

export const generateAccessToken = user =>
  // TODO: set expiresIn in env
  jwt.sign({ id: user.uuid }, process.env.SECRET, { expiresIn: '1d' })

export default () => {
  return async function(ctx, next) {
    if (ctx.user) {
      const accessToken = ctx.cookies.get('access_token', { signed: true })
      try {
        jwt.verify(accessToken, process.env.SECRET)
      } catch (e) {
        ctx.cookies.set('access_token', generateAccessToken(ctx.user), {
          domain: process.domain,
          signed: true,
          // TODO: set them to true in production & staging
          // secure: true,
          // httpOnly: true,
        })
      }
    }

    await next()
  }
}
