import jwt from 'jsonwebtoken'

export default user =>
  jwt.sign({ id: user.uuid }, process.env.SECRET, { expiresIn: '1d' })
