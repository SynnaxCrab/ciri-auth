import Koa from 'koa'
import koaRouter from 'koa-router'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'

const app = new Koa()
const router = new koaRouter()
const { PORT = 3000 } = process.env

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(ctx => {
  ctx.body = 'Hello Koa'
})

app.listen(PORT)
