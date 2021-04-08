const { Sequelize, Model, DataTypes } = require('sequelize')
const hashString = require('./utils/hashString.js')
const config = require('./config')

const hashStr = hashString(config.hash)

let sequelize

class User extends Model {}

const initialize = (db) => {
  if (sequelize) {
    throw new Error('Already initialized')
  }

  sequelize = new Sequelize(db)

  User.init({
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING
  }, { sequelize, modelName: 'user' })

  User.addHook('beforeCreate', (user) => {
    user.password = hashStr(user.password)
  })

  sequelize.sync()
}

const createUser = async (fullname, email, password) => {
  if (await findUser(email)) {
    throw new Error('Invalid email or password')
  }

  return User.create({ fullname, email, password })
}

const listUsers = async () => User.findAll({ attributes: { exclude: ['id'] } })

const findUser = async (email, password) => {
  const where = { email }
  if (password !== undefined) {
    where.password = hashStr(password)
  }

  return User.findOne({ where, attributes: ['fullname', 'email'] })
}

const deleteUser = async (email) => User.destroy({ where: { email } })

module.exports = {
  createUser,
  deleteUser,
  initialize,
  listUsers,
  findUser,
  listTokens
}