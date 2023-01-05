const express = require("express")
const multer = require("multer")
const fs = require("fs/promises")
const base_dir = require("../assets")
const maxSize = 5242880 // 5 MB

const router = express.Router()
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads")
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + `${Date.now()}-${file.originalname}`)
        },
    }),
    // limits: { fileSize: maxSize },
    fileFilter: (req, file, callback) => {
        const fileSize = parseInt(req.headers['content-length']);
        if (fileSize > maxSize) {
            return callback("File too large");
        }
        callback(null, true);
    }
}).single("file-upload")

router.get('/', (req, res) => {
    const open = async () => {
        try {
            const dir = await fs.opendir('./uploads/');
            res.write("The files are:-\n")
            for await (const dirent of dir)
                res.write(`${dirent.name}\n`);

            res.end()
        } catch (err) {
            console.error(err);
        }
    }
    open()
})
router.get('/:file', (req, res) => {
    res.sendFile(`${base_dir}/uploads/${req.params.file}`)
})

router.post('/upload', upload, (req, res) => {
    res.send("file received")
})

router.delete('/delete/:file', (req, res) => {
    const open = async () => {
        try {
            await fs.unlink(`./uploads/${req.params.file}`);
            console.log(`sucessfully deleted ${req.params.file}`);
            res.send("File successfully deleted")
        } catch (error) {
            console.error('Error:', error.message);
            res.send("Error!!!")
        }
    }
    open()
})

module.exports = router