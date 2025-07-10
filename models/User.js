const { DataTypes } = require('sequelize');
const db1 = require('../config/database')

const User = db1.define('User', {
    username : {
        type : DataTypes.STRING,
        allowNull: false
    },
    email : {
        type : DataTypes.STRING,
        allowNull: false
    },
    password : {
        type : DataTypes.STRING,
        allowNull: false
    },
    refresh_token : {
        type : DataTypes.TEXT,
        allowNull: true
    },
    role : {
        type : DataTypes.ENUM('siswa', 'stan', 'admin'),
        allowNull : false
    }
})

module.exports = User