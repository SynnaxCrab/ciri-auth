import Koa from 'koa'
import koaRouter from 'koa-router'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import { Strategy } from 'passport-twitter'

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
    function(token, tokenSecret, profile, cb) {
      console.log(profile._json.email)
      return cb()
      User.findOrCreate({ twitterId: profile.id }, function(err, user) {
        return cb(err, user)
      })
    },
  ),
)

router.get('/auth/twitter', passport.authenticate('twitter'))
router.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/')
  },
)

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
