import crypto from 'crypto'

export default () => {
  const buf = crypto.randomBytes(256)
  return crypto
    .createHash('sha1')
    .update(buf)
    .digest('hex')
}
