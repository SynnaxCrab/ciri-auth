import Debug from 'debug'
import Koa from 'koa'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'

import auth from './auth'
import accessToken from './access_token'

const debug = Debug('app')
const app = new Koa()
const { PORT = 3000 } = process.env

app.use(bodyParser())
app.keys = [process.env.SECRET]
app.use(session({}, app))
app.use(passport.initialize())
app.use(passport.session())
app.use(auth.routes())
app.use(auth.allowedMethods())
app.use(accessToken())

app.use(ctx => {
  if (ctx.isAuthenticated()) {
    ctx.redirect(process.env.APP_URL)
  } else {
    ctx.body = 401
  }
})

app.listen(PORT)
debug(`Listening on PORT: ${PORT}`)
