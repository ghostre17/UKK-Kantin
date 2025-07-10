const { DataTypes } = require('sequelize')
const db1 = require('../config/database')
const Diskon = require('./Diskon')
const Menu = require('./Menu')

const Menu_diskon = db1.define('Menu_diskon', {
    id_menu : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references : {
            model : Menu,
            key : 'id'
        },
    },
    id_diskon : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references : {
            model : Diskon,
            key : 'id'
        },
    },
})

Menu.hasMany(Menu_diskon , { foreignKey: 'id_menu', as : 'menu_diskon' })
Menu_diskon.belongsTo(Menu, { foreignKey: 'id_menu', as : 'menu' })

Diskon.hasMany(Menu_diskon, { foreignKey: 'id_diskon', as : 'menu_diskon' })
Menu_diskon.belongsTo(Diskon, { foreignKey: 'id_diskon', as : 'diskon' })

module.exports = Menu_diskon