const {Sequelize} =  require('sequelize')

const db1 = new Sequelize('ukk_kantin', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
})

module.exports = db1