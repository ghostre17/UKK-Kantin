const express = require('express');
const router = express.Router()
const menuController = require('../controllers/MenuControllers')
const userController = require('../controllers/UserControllers')
const siswaController = require('../controllers/SiswaControllers')
const stanController = require('../controllers/StanControllers')
const transaksiController = require('../controllers/TransaksiControllers')
const upload = require('../middleware/multer')
const diskonController = require('../controllers/DiskonControllers')
const { authenticate, authRole } = require('../middleware/auth')



// Admin Only!
router.get('/user', authenticate, authRole(['admin']), userController.findAllUser)
router.put('/user/:id', authenticate, authRole(['admin']), userController.updateUser)

// Login, Logout, and Register
router.post('/register', userController.register)
router.post('/login', userController.login)
router.delete('/user', authenticate, userController.logout)

// Siswa Only!
router.get('/siswa', authenticate, authRole(['siswa']), siswaController.profileSiswa)
router.get('/siswa/transaction-history', authenticate, authRole(['siswa']), siswaController.historySiswa)
router.get('/siswa/queue', authenticate, authRole(['siswa']), siswaController.queueSiswa)
router.get('/siswa/print/:id', authenticate, authRole(['siswa']), siswaController.notaSiswa)
router.put('/siswa', authenticate, authRole(['siswa']), siswaController.updateSiswa)
router.delete('/siswa', authenticate, authRole(['siswa']), siswaController.deleteSiswa)
router.delete('/siswa/queue/:id', authenticate, authRole(['siswa']), transaksiController.cancelTransaction)

// Stan Only!
// ---Update Profile Stan---
router.get('/stan', authenticate, authRole(['stan']), stanController.profileStan)
router.get('/stan/income', authenticate, authRole(['stan']), stanController.incomeStan)
router.put('/stan', authenticate, authRole(['stan']), stanController.updateStan)
router.delete('/stan', authenticate, authRole(['stan']), stanController.deleteStan)
// ---Update Menu Stan---
router.get('/menu', authenticate, authRole(['stan']), menuController.getOwnMenu)
router.post('/menu', authenticate, authRole(['stan']), upload.single('foto'), menuController.createMenu)
router.put('/menu/:id', authenticate, authRole(['stan']), upload.single('foto'), menuController.updateMenu)
router.delete('/menu/:id', authenticate, authRole(['stan']), menuController.deleteMenu)
// ---Transaksi Section---
router.get('/stan/transaksi', authenticate, authRole(['stan']), transaksiController.getTransaksi)
router.get('/stan/queue', authenticate, authRole(['stan']), transaksiController.queueTransaksi)
router.get('/stan/transaksi/:filter', authenticate, authRole(['stan']), transaksiController.searchTransaksi)
router.put('/stan/transaksi/:id', authenticate, authRole(['stan']), transaksiController.updateTransaksi)
// ---Discount Section---
router.get('/stan/discount-menu', authenticate, authRole(['stan']), diskonController.getDiscMenus)
router.get('/stan/menu-discount', authenticate, authRole(['stan']), diskonController.getMenuDisc)
router.get('/stan/discount', authenticate, authRole(['stan']), diskonController.getDisc)
router.post('/stan/discount', authenticate, authRole(['stan']), diskonController.createDisc)
router.post('/stan/assign-discount', authenticate, authRole(['stan']), diskonController.assignDisc)
router.delete('/stan/disconnecting-discount/:filter', authenticate, authRole(['stan']), diskonController.disconnectedDisc)
router.delete('/stan/discount/:filter', authenticate, authRole(['stan']), diskonController.deleteDisc)



// Public Routes
router.get('/search/stan', authenticate, stanController.getAllStan)
router.get('/search/stan/:filter', authenticate, stanController.getStan)
router.get('/search/stan/:filter/menu', authenticate, menuController.getMenu)
router.get('/search/stan/:filter/menu/:filterfood', authenticate, menuController.findMenu)
router.post('/search/stan/:filter/menu/:filterfood', authenticate, transaksiController.createTransaksi)



module.exports = router