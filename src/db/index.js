import { Pool } from 'pg'

const pool = new Pool()

export const query = async sql => {
  try {
    const res = await pool.query(sql)
    await pool.end()
    return res
  } catch (err) {
    console.log(err.stack)
  }
}
