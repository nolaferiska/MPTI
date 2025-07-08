const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/dokumen-anak'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'dokumen_' + uniqueSuffix + ext);
    }
});

// File filter
function fileFilter(req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF, DOC, atau DOCX yang diperbolehkan'));
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;