const { DataTypes } = require('sequelize')
const db1 = require('../config/database')
const Stan = require('./Stan')

const Menu = db1.define('Menu', {
    food: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('drinks', 'foods'),
        allowNull: false
    },
   foto: {
    type: DataTypes.STRING,
    allowNull: true
   },
   id_stan : {
    type: DataTypes.INTEGER,
    allowNull: false,
    references : {
        model: Stan,
        key: 'id'
    }
   }
}, {
    freezeTableName: true
}
)

Stan.hasMany(Menu, { foreignKey: 'id_stan', as : 'menu'})
Menu.belongsTo(Stan, { foreignKey: 'id_stan', as : 'stan'})

module.exports = Menu