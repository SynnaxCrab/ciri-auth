import Debug from 'debug'
import koaRouter from 'koa-router'
import passport from 'koa-passport'
import { Strategy } from 'passport-twitter'

import { findUserByUuid, findOrCreateUserByTwitter } from './db'

const debug = Debug('auth')
const router = new koaRouter()

passport.use(
  new Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      userProfileURL:
        'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      callbackURL: process.env.TWITTER_CALLBACK_URL,
    },
    async function(token, tokenSecret, profile, cb) {
      const profileJson = profile._json
      const params = {
        name: profileJson.screen_name,
        twitterId: profileJson.id,
        email: profileJson.email,
      }
      try {
        const user = await findOrCreateUserByTwitter(params)
        return cb(null, user)
      } catch (e) {
        debug(e)
        return cb(e)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.uuid)
})

passport.deserializeUser(async (uuid, done) => {
  const user = await findUserByUuid(uuid)
  done(null, user)
})

router.get('/auth/twitter', passport.authenticate('twitter'))

router.get('/auth/twitter/callback', (ctx, next) => {
  return passport.authenticate(
    'twitter',
    { failureRedirect: '/login' },
    async (err, user, info) => {
      console.log(err)
      console.log(user)
      ctx.login(user)
      await next()
    },
  )(ctx)
})

export default router
