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
    fullname: {
      type: DataTypes.STRING,
      validate: {
        min: 5
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        min: 8,
        isAlfaNumeric: (value) => {
          const rules = [
            {
              condition: !/[0-9]+/.test(value),
              errorMsg: 'one number'
            },
            {
              condition: !/[A-Za-z]+/.test(value),
              errorMsg: 'one character'
            }
          ]

          const failed = rules.reduce((messages, { condition, errorMsg }) => {
            if (!condition) {
              messages.push(errorMsg)
            }

            return messages
          }, [])

          if (failed.length) {
            throw new Error(`Password must contain ${failed.join(', ')}`)
          }
        }
      }
    },
    token: DataTypes.TEXT
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

const listUsers = async () => User.findAll({ attributes: { exclude: ['id'] }, raw: true })

const findUser = async (email, password) => {
  const where = { email }
  if (password !== undefined) {
    where.password = hashStr(password)
  }

  return User.findOne({ where })
}

const deleteUser = async (email) => User.destroy({ where: { email } })

module.exports = {
  createUser,
  deleteUser,
  initialize,
  listUsers,
  findUser
}