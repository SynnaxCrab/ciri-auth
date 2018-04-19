import Koa from 'koa'
import koaRouter from 'koa-router'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import { Strategy } from 'passport-twitter'

import { findUserByUuid, findOrCreateByTwitter } from './db'

const app = new Koa()
const router = new koaRouter()
const { PORT = 3000 } = process.env

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
        const { rows } = await findOrCreateByTwitter(params)
        return cb(null, rows[0])
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
  const { rows } = await findUserByUuid(uuid)
  done(null, rows[0])
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

app.use(bodyParser())
app.keys = ['secret']
app.use(session({}, app))
app.use(passport.initialize())
app.use(passport.session())
app.use(router.routes())
app.use(router.allowedMethods())

app.use(ctx => {
  ctx.body = 'Hello Koa'
})

app.listen(PORT)
