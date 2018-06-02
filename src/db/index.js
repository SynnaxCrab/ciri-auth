import Debug from 'debug'
import { Pool } from 'pg'
import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import uuidv4 from 'uuid/v4'

const pool = new Pool()
const debug = Debug('db')

const QUERY = async (sql, client = pool) => {
  try {
    const { rows } = await client.query(sql)
    return rows
  } catch (e) {
    debug(e)
    throw e
  }
}
/**
 * Identity exists check SQL
 *
 * @param {String} uid
 * @param {String} provider
 * @returns {String}
 *
 */

const identityExistsSQL = (uid, provider) => sql`
  SELECT user_id
  FROM identities
  ${WHERE({ uid, provider })}
`

/**
 * Check whether identity exists
 *
 * @param {String} uid
 * @param {String} provider
 * @returns {String}
 *
 */

const identityExists = async (uid, provider) => {
  const rows = await QUERY(identityExistsSQL(uid, provider))
  return rows[0]
}

/**
 * Create Identity SQL
 *
 * @param {Object} { uid, userId, provider }
 * @returns {Object}
 */

const createIdentitySQL = ({ uid, userId, provider }) => sql`
  ${INSERT('identities', {
    uuid: uuidv4(),
    uid,
    provider,
    user_id: userId,
  })}
  RETURNING id
`
/**
 * Create Identity
 *
 * @param {any} data
 */

export const createIdentity = async (data, client = pool) =>
  await QUERY(createIdentitySQL(data), client)

/**
 * Create User SQL
 *
 * @param {Object} { email, name }
 * @returns {String}
 */

const createUserSQL = ({ email, name }) => sql`
  ${INSERT('users', {
    uuid: uuidv4(),
    email,
    name,
  })}
  RETURNING id
`
/**
 * Create User
 *
 * @param {Object} data
 * @returns {Object}
 */

export const createUser = async (data, client = pool) => {
  const rows = await QUERY(createUserSQL(data, client))
  return rows[0]
}

/**
 * User SQL by ID
 *
 * @param {String} id
 * @returns {String}
 */

const userSQL = id => sql`
  SELECT *
  FROM users
  ${WHERE({ id })}
`

/**
 * Find User with ID
 *
 * @param {String} id
 * @returns {Object}
 */

export const findUser = async id => {
  const rows = await QUERY(userSQL(id))
  return rows[0]
}

/**
 * User SQL by uuid
 *
 * @param {any} uuid
 */

const userSQLByUuid = uuid => sql`
  SELECT *
  FROM users
  ${WHERE({ uuid })}
`

/**
 * Find User by uuid
 *
 * @param {any} uuid
 * @returns {Object}
 */

const findUserByUuid = async uuid => {
  const rows = await QUERY(userSQLByUuid(uuid))
  return rows[0]
}

export const findOrCreateUserByGithub = async ({ node_id, email, name }) => {
  const client = await pool.connect()
  try {
    const userId = await identityExists(node_id, 'github')

    if (userId) {
      return await findUser(userId, client)
    } else {
      await client.query('BEGIN')
      const createdUser = await createUser({ email, name }, client)
      await createIdentity(
        {
          uid: node_id,
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
