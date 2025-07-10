const { DataTypes } = require('sequelize');
const db1 = require('../config/database');

const Transaksi = db1.define('Transaksi', {
    tanggal : {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue : DataTypes.NOW
    },
    id_stan : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_siswa : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status : {
        type: DataTypes.ENUM('belum dikonfirm', 'dimasak', 'sampai'),
        defaultValue : 'belum dikonfirm'
    }
})

module.exports = Transaksi