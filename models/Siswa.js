const { DataTypes } = require('sequelize');
const db1 = require('../config/database');
const User = require('./User')

const Siswa = db1.define('Siswa', {
    nama_siswa : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    alamat : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    no_telp : {
        type: DataTypes.STRING,
        allowNull: false
    },
    foto : {
        type: DataTypes.STRING,
        allowNull: true
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

User.hasOne(Siswa, { foreignKey: 'id_user', as: 'siswa'})
Siswa.belongsTo(User, { foreignKey: 'id_user', as: 'user'})

module.exports = Siswa