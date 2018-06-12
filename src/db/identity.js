import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import uuidv4 from 'uuid/v4'
import QUERY from './query'

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

export const identityExists = async (uid, provider) => {
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
