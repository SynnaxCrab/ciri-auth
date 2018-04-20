import Debug from 'debug'
import { Pool } from 'pg'
import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import uuidv4 from 'uuid/v4'

const pool = new Pool()
const debug = Debug('db')

const identityExistsSQL = uid => sql`
  SELECT user_id
  FROM identities
  ${WHERE({ uid })}
`

const createIdentitySQL = ({ uid, userId }) => sql`
  ${INSERT('identities', {
    uuid: uuidv4(),
    uid,
    provider: 'twitter',
    user_id: userId,
  })}
`

const createUserSQL = ({ email, name }) => sql`
  ${INSERT('users', {
    uuid: uuidv4(),
    email,
    name,
  })}
  RETURNING id
`

const userSQL = id => sql`
  SELECT *
  FROM users
  ${WHERE({ id })}
`

const userSQLByUuid = uuid => sql`
  SELECT *
  FROM users
  ${WHERE({ uuid })}
`

export const findUserByUuid = async uuid => {
  try {
    const { rows } = await pool.query(userSQLByUuid(uuid))
    return rows[0]
  } catch (e) {
    debug(e)
    throw e
  }
}

export const findOrCreateUserByTwitter = async ({ twitterId, email, name }) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(identityExistsSQL(twitterId))
    let userId = rows[0].user_id

    if (!rows.length) {
      await client.query('BEGIN')
      const { rows: createUserRows } = await client.query(
        createUserSQL({ email, name }),
      )
      userId = createUserRows[0].id
      await client.query(
        createIdentitySQL({
          uid: twitterId,
          userId,
        }),
      )
      await client.query('COMMIT')
    }

    const { rows: userRows } = await client.query(userSQL(userId))
    return userRows[0]
  } catch (e) {
    await client.query('ROLLBACK')
    debug(e)
    throw e
  } finally {
    client.release(true)
  }
}
