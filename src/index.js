const { resolve } = require('path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { authenticate } = require('./middlewares')
const { initialize, listUsers, findUser, createUser, deleteUser } = require('./db.js')

const config = require('./config')

initialize(`sqlite::${resolve(__dirname, '../dist/storage')}`, config)
const auth = authenticate(config.tokenSecret)

const app = express()
app.use(cors())
app.use(express.json())

const port = 8080

app.get('/', async (req, res) => {
  res.json(await listUsers())
})

app.post('/user', async (req, res) => {
  const { fullname, email, password } = req.body
  try {
    const user = await createUser(fullname, email, password)
    res.json(user)
  } catch ({ message }) {
    res.status(400).json({ message })
  }
})

app.delete('/user', auth, async (req, res) => {
  const { email } = req.userData
  const deleted = await deleteUser(email)
  res.sendStatus(deleted ? 200 : 400)
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const userInst = await findUser(email, password)

  if (!userInst) {
    return res.sendStatus(400)
  }

  const token = jwt.sign(userInst.get(), config.tokenSecret, { expiresIn: config.tokenTTL })
  await userInst.update({ token })

  res.json({ token })
})

app.post('/logout', auth, async (req, res) => {
  const { token, email } = req.userData
  if (token && email) {
    const userInst = await findUser(email)

    if (userInst?.get()?.token) {
      console.info(`User logged out: ${email}`)
      await userInst.update({ token: '' })
    }
  }

  res.sendStatus(204)
})

app.listen(port, async () => {
  console.info(`Listening at ${port}`)
})