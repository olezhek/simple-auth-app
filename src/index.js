const { resolve } = require('path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { hashPassword, authenticate } = require('./middlewares')
const { initialize, listUsers, findUser, createUser, deleteUser } = require('./db.js')

const config = require('./config')

initialize(`sqlite::${resolve('../dist/storage')}`)
const auth = authenticate(config.tokenSecret)
const hashPwdMw = hashPassword(config.hash)

const app = express()
app.use(cors())
app.use(express.json())

const port = 8080

app.get('/', async (req, res) => {
  res.json(await listUsers())
})

app.post('/user', hashPwdMw, async (req, res) => {
  const { fullname, email, password } = req.body
  try {
    const user = await createUser(fullname, email, password)
    res.json(user)
  } catch (e) {
    res.json({ message: e.message }, 400)
  }
})

app.delete('/user', auth, async (req, res) => {
  const { email } = req.userData
  const deleted = await deleteUser(email)
  res.sendStatus(deleted ? 200 : 400)
})

app.post('/login', hashPwdMw, async (req, res) => {
  const { email, password } = req.body
  const user = await findUser(email, password)

  if (!user) {
    return res.sendStatus(400)
  }

  token = jwt.sign(user, config.tokenSecret, { expiresIn: config.tokenTTL })
  res.json({ token })
})

app.listen(port, async () => {
  console.info(`Listening at ${port}`)
})