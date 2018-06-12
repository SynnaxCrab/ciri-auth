import { Pool } from 'pg'
import { identityExists, createIdentity } from './identity'
import { findUser, createUser } from './user'

const pool = new Pool()

export const findOrCreateUserByTwitter = async ({ twitterId, email, name }) => {
  const client = await pool.connect()
  try {
    let userId
    const { rows } = await client.query(identityExistsSQL(twitterId))

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
    } else {
      userId = rows[0].user_id
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
