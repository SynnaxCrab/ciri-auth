import Debug from 'debug'
import koaRouter from 'koa-router'
import oauth2 from 'simple-oauth2'
import fetch from 'node-fetch'

import randomToken from './utils/token'
import { findUserByUuid } from './db/user'
import { findOrCreateUserByGithub } from './db/github'
import { authorize } from './oauth2'

const debug = Debug('auth:github')
const router = new koaRouter()

const client = oauth2.create({
  client: {
    id: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
})

export const authorizationUri = client.authorizationCode.authorizeURL({
  redirect_uri: process.env.GITHUB_CALLBACK_URL,
  scope: 'notifications,repo',
  state: randomToken(),
})

router.get('/github/callback', async (ctx, next) => {
  const code = ctx.query.code
  const options = {
    code,
  }

  try {
    const result = await client.authorizationCode.getToken(options)
    const { token } = client.accessToken.create(result)

    const res = await fetch(
      `https://api.github.com/user?access_token=${token.access_token}`,
    )
    const userInfo = await res.json()
    const user = await findOrCreateUserByGithub(userInfo)
    ctx.user = user
    const authorizationCode = await authorize(ctx)
    ctx.redirect(`${process.env.APP_CALLBACK_URL}?code=${authorizationCode}`)
  } catch (e) {
    console.error(e)
  }
})

export default router
