import { sql } from 'pg-sql'
import { WHERE } from 'pg-sql-helpers'
import QUERY from './query'

/**
 * Client SQL by uid or (uid & secret)
 *
 * @param {*} uid
 * @param {*} secret
 * @returns {String}
 */

const clientSQL = (uid, secret) => {
  const filers = secret ? { uid, secret } : { uid }
  return sql`
    SELECT *
    FROM oauth_clients
    ${WHERE(filers)}
  `
}

/**
 * Find client
 *
 * @param {*} clientId
 * @param {*} clientSecret
 * @returns {Object}
 */

export const findClient = async (clientId, clientSecret) => {
  const rows = await QUERY(clientSQL(clientId, clientSecret))
  return rows[0]
}
