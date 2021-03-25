const { resolve } = require('path')
const express = require('express')
const cors = require('cors')
const { initialize, listUsers, createUser, deleteUser } = require('./db.js')

initialize(`sqlite::${resolve('../dist/storage')}`)

const app = express()
app.use(cors())
app.use(express.json())

const port = 8080

app.get('/', async (req, res) => {
  res.json(await listUsers())
})

app.post('/user', async (req, res) => {
  const { fullname, email, password } = req.body
  res.json(await createUser(fullname, email, password))
})

app.delete('/user', async (req, res) => {
  const { email } = req.body
  const deleted = await deleteUser(email)
  const status = deleted ? 200 : 400
  res.send(status)
})

app.listen(port, async () => {
  console.info(`Listening at ${port}`)
})