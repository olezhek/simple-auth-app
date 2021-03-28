const crypto = require('crypto')

const hashPassword = (hash) => {
  return (req, res, next) => {
    if (req.body.password) {
      req.body.password = crypto.createHash(hash).update(req.body.password).digest('hex')
    }

    return next()
  }
}

module.exports = hashPassword