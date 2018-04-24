import Debug from 'debug'
import Koa from 'koa'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'

import auth from './auth'

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

app.use(ctx => {
  const body = ctx.isAuthenticated() ? 'hello koa' : '401'
  ctx.body = body
})

app.listen(PORT)
debug(`Listening on PORT: ${PORT}`)
