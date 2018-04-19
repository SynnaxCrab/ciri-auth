import { Pool } from 'pg'
import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import uuidv4 from 'uuid/v4'

const pool = new Pool()

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

export const findOrCreateByTwitter = async ({ twitterId, email, name }) => {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(identityExistsSQL(twitterId))
    let userId = rows[0].user_id

    if (!rows.length) {
      await client.query('BEGIN')
      const userRes = await client.query(createUserSQL({ email, name }))
      userId = userRes.rows[0].id
      await client.query(
        createIdentitySQL({
          uid: twitterId,
          userId,
        }),
      )
      await client.query('COMMIT')
    }

    return await client.query(userSQL(userId))
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release(true)
  }
}
