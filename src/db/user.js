import { sql } from 'pg-sql'
import { INSERT, UPDATE, WHERE } from 'pg-sql-helpers'
import uuidv4 from 'uuid/v4'
import QUERY from './query'

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
  RETURNING id, uuid
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

export const findUserByUuid = async uuid => {
  const rows = await QUERY(userSQLByUuid(uuid))
  return rows[0]
}
