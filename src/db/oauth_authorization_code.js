import { sql } from 'pg-sql'
import { INSERT, WHERE } from 'pg-sql-helpers'
import QUERY from './query'

const createAuthorizationCodeSQL = values => sql`
  ${INSERT('oauth_authorization_codes', values)}
  RETURNING *
`

export const createAuthorizationCode = async values => {
  const rows = await QUERY(createAuthorizationCodeSQL(values))
  return rows[0]
}

const authorizationCodeSQL = code => sql`
  SELECT *
  FROM oauth_authorization_codes
  ${WHERE({ code })}
`

export const findAuthorizationCode = async code => {
  const rows = await QUERY(authorizationCodeSQL(code))
  return rows[0]
}
