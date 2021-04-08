const jwt = require('jsonwebtoken')

const authenticate = (secret) => (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization) {
    return res.sendStatus(401)
  }

  const token = authorization.split(' ')[1]
  jwt.verify(token, secret, (err, data) => {
    if (err) {
      return res.sendStatus(403)
    }

    req.userData = { ...data, token }
    return next()
  })
}

module.exports = authenticate
