import jwt from 'jsonwebtoken'

export const accessToken = user =>
  jwt.sign({ id: user.uuid }, process.env.SECRET, { expiresIn: '1d' })

export default () => {
  return async function(ctx, next) {
    ctx.cookies.set('access_token', accessToken(ctx.state.user), {
      domain: process.domain,
      signed: true,
      // TODO: set them to true in production & staging
      // secure: true,
      // httpOnly: true,
    })
    await next()
  }
}
