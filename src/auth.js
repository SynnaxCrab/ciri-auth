import koaRouter from 'koa-router'
import passport from 'koa-passport'
import { Strategy } from 'passport-twitter'

import { findUserByUuid, findOrCreateUserByTwitter } from './db'

const router = new koaRouter()

passport.use(
  new Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      userProfileURL:
        'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback',
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
    (err, user, info) => {
      ctx.login(user)
      ctx.redirect('/')
    },
  )(ctx)
})

export default router
