import Debug from 'debug'
import { Pool } from 'pg'

const pool = new Pool()
const debug = Debug('db')

/**
 * PG query wrapper with error handling
 *
 * @param {String} sql
 * @param {Object} [client=pool]
 * @returns {Object}
 */

const QUERY = async (sql, client = pool) => {
  try {
    const { rows } = await client.query(sql)
    return rows
  } catch (e) {
    debug(e)
    throw e
  }
}

export default QUERY
