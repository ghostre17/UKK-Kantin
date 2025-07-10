const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, './images')
    },

    filename : (req, file, cb) => {
        cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,

    fileFilter : (req, file, cb) => {
        const imgType = ['image/jpg', 'image/jpeg', 'image/png']
        if (!imgType.includes(file.mimetype)){
            cb(null, false)
            return cb('Invalid file type', file.mimetype)
        }

        const filesize = req.headers[file.size]
        const maxsize = (10*485*760)

        if(filesize > maxsize){
            cb(null, false)
            return cb('file size is too large')
        }

        cb(null, true)
    }
})

module.exports = upload