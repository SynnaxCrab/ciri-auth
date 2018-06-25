import Debug from 'debug'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import github from './github'
import oauth2 from './oauth2'

const debug = Debug('app')
const app = new Koa()
const { PORT = 3000 } = process.env

app.use(bodyParser())
app.keys = [process.env.SECRET]
app.use(github.routes())
app.use(github.allowedMethods())
app.use(oauth2.routes())
app.use(oauth2.allowedMethods())

// app.use(ctx => {
//   if (ctx.user) {
//     ctx.redirect(process.env.APP_URL)
//   } else {
//     ctx.body = 401
//   }
// })

app.listen(PORT)
debug(`Listening on PORT: ${PORT}`)
