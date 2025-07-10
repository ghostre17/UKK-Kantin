const { DataTypes } = require('sequelize')
const db1 = require('../config/database')
const Transaksi = require('./Transaksi')

const Detail_transaksi = db1.define('Detail_transaksi', {
    id_transaksi : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references : {
            model : Transaksi,
            key : 'id'
        }
    },
    id_menu : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    harga_beli : {
        type: DataTypes.FLOAT,
        allowNull: false
    }
})

Transaksi.hasMany(Detail_transaksi, { foreignKey: 'id_transaksi', as : 'id_transaksi' })
Detail_transaksi.belongsTo(Transaksi, { foreignKey: 'id_transaksi', as : 'transaksi' })

module.exports = Detail_transaksi