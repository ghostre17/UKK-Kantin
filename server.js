const express = require('express');
const cors = require('cors');
const db1 = require('./config/database');
const router = require('./routes/routes')
require('dotenv').config();

const Menu = require('./models/Menu');
const Siswa = require('./models/Siswa')
const Stan = require('./models/Stan')
const Transaksi = require('./models/Transaksi')
const User = require('./models/User')
const Menu_diskon = require('./models/Menu_diskon')
const Diskon = require('./models/Diskon')
const Detail_transaksi = require('./models/Detail_transaksi')

const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());
app.use('/api', router)

db1.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });

// (async () => {
//     try {
//         await db1.sync({ alter: true }); 
//         console.log('Table synchronized...');
//     } catch (error) {
//         console.error('Error synchronizing tables:', error.message);
//     }
// })(); 

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
