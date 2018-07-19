import { sql } from 'pg-sql'
import { INSERT, WHERE } from 'pg-sql-helpers'
import QUERY from './query'

const createTokenSQL = values => sql`
  ${INSERT('oauth_tokens', values)}
  RETURNING *
`

export const createToken = async values => {
  const rows = await QUERY(createTokenSQL(values))
  return rows[0]
}
