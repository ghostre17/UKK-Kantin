const { DataTypes } = require("sequelize");
const db1 = require('../config/database')
const Stan = require('./Stan')

const Diskon = db1.define('Diskon', {
    nama_diskon : {
        type: DataTypes.STRING,
        allowNull: false
    },
    persentase_diskon : {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tanggal_awal : {
        type: DataTypes.DATE,
        allowNull: false
    },
    tanggal_akhir : {
        type: DataTypes.DATE,
        allowNull: false,
        validate : {
            isAfter(value) {
                if (this.tanggal_awal && value < this.tanggal_awal) {
                    throw new Error('Tanggal akhir tidak boleh lebih dari tanggal awal')
                }
            }
        }
    },
    id_stan : {
        type : DataTypes.INTEGER,
        references : {
            model : 'stan',
            key : 'id'
        }   
    }
}, {
    freezeTableName : true
}
)

Stan.hasMany(Diskon, { foreignKey: 'id_stan', as : 'diskon' })
Diskon.belongsTo(Stan, { foreignKey: 'id_stan', as : 'stan' })

module.exports = Diskon