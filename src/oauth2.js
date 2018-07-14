import jwt from 'jsonwebtoken'
import OAuth2Server, { Request, Response } from 'oauth2-server'
import koaRouter from 'koa-router'
import * as oauth2Queries from './db/oauth2'
import { authorizationUri as githubAuthorizationUri } from './github'

const router = new koaRouter()
const oauth = new OAuth2Server({
  model: oauth2Queries,
})

export const authorize = async ctx => {
  // TODO: use db to access special oauth client used for ourselves
  ctx.query = {
    client_id: 'c283ef876656a427af9f0d9c959df1c6c52341b9',
    state: 'uuu',
    response_type: 'code',
    grant: 'authorization_code',
    redirect_uri: 'http://127.0.0.1:4000',
  }

  const { request, response } = ctx
  if (ctx.user) {
    return await oauth.authorize(new Request(request), new Response(response), {
      authenticateHandler: {
        handle: () => ctx.user,
      },
    })
  } else {
    return null
  }
}

router.get('/authorize', async ctx => {
  const { provider, client_id, state, response_type, grant } = ctx.query

  const authorizationUri = provider => {
    switch (provider) {
      case 'github':
        return githubAuthorizationUri
      default:
        // TODO: use a default url
        return 'https://google.com'
    }
  }

  ctx.redirect(authorizationUri(provider))
})

router.post('/access_token', async (ctx, next) => {
  const { request, response } = ctx
  const { accessToken } = await oauth.token(
    new Request(request),
    new Response(response),
  )
  const access_token = jwt.sign({ accessToken }, process.env.SECRET, {
    expiresIn: '1d',
  })
  ctx.body = { access_token }
})

export default router
