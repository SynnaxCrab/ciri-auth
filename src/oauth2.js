import OAuth2Server, { Request, Response } from 'oauth2-server'
import koaRouter from 'koa-router'
import * as oauth2Queries from './db/oauth2'

const router = new koaRouter()
const oauth = new OAuth2Server({
  model: oauth2Queries,
})

router.get('/authorize', async (ctx, next) => {
  const { request, response } = ctx
  const user = {}
  if (user) {
    const code = await oauth.authorize(
      new Request(request),
      new Response(response),
      {
        authenticateHandler: {
          handle: () => user,
        },
      },
    )
    ctx.body = code.authorizationCode
  } else {
    // TODO: maybe redirect to login page, anyway this is not the expected bahavior
    ctx.status = 401
  }
})

router.post('/access_token', async (ctx, next) => {})

export default router
