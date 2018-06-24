import Debug from 'debug'
import { Pool } from 'pg'
import { identityExists, createIdentity } from './identity'
import { findUser, createUser } from './user'

const debug = Debug('db')
const pool = new Pool()

export const findOrCreateUserByGithub = async ({ node_id, email, name }) => {
  const client = await pool.connect()
  try {
    const identity = await identityExists(node_id, 'github')

    if (identity) {
      return await findUser(identity.user_id, client)
    } else {
      await client.query('BEGIN')
      const createdUser = await createUser({ email, name }, client)
      await createIdentity(
        {
          uid: node_id,
          provider: 'github',
          userId: createdUser.id,
        },
        client,
      )
      await client.query('COMMIT')
      return createdUser
    }
  } catch (e) {
    await client.query('ROLLBACK')
    debug(e)
    throw e
  } finally {
    client.release(true)
  }
}
