const { DataTypes } = require('sequelize');
const db1 = require('../config/database');
const User = require('./User')

const Stan = db1.define('Stan', {
    nama_stan : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nama_pemilik : {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_telp : {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    id_user : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references : { 
            model : User,
            key: 'id'
        }
    }
}, {
    freezeTableName: true
})

User.hasOne(Stan, { foreignKey: 'id_user', as: 'stan'})
Stan.belongsTo(User, { foreignKey: 'id_user', as: 'user'})

module.exports = Stan