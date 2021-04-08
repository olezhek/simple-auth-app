const crypto = require('crypto')

const hashString = (hash) => (str) => crypto.createHash(hash).update(str).digest('hex')

module.exports = hashString
