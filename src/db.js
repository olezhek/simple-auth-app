const { Sequelize, Model, DataTypes } = require('sequelize')

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
    password: DataTypes.STRING
  }, { sequelize, modelName: 'user' });

  (async () => await sequelize.sync())()
}

const createUser = async (fullname, email, password) => User.create({ fullname, email, password })

const listUsers = async () => User.findAll()

const deleteUser = async (email) => User.destroy({ where: { email } })

module.exports = {
  createUser,
  deleteUser,
  initialize,
  listUsers
}