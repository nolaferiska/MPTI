const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAdmin, redirectIfAuth } = require('../middleware/auth');
const { AdminController } = require('../controllers');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/aktivitas/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function(req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Admin login page
router.get('/login', redirectIfAuth(), AdminController.showLogin);

// Process admin login
router.post('/login', redirectIfAuth(), AdminController.processLogin);

// Admin logout
router.get('/logout', AdminController.logout);

// Protected admin routes
router.use(requireAdmin);

// Admin dashboard
router.get('/dashboard', AdminController.showDashboard);

// Kelola Data Anak - Main routes
router.get('/anak', AdminController.showAnak);
router.get('/anak/add', AdminController.showAddAnak);
router.post('/anak/add', AdminController.addAnak);
router.get('/anak/edit/:id', AdminController.showEditAnak);
router.post('/anak/edit/:id', AdminController.editAnak);
router.get('/anak/delete/:id', AdminController.deleteAnak);
router.get('/anak/detail/:id', AdminController.showAnakDetail);

// Kelola Data Pengasuh - Main routes
router.get('/pengasuh', AdminController.showPengasuh);
router.get('/pengasuh/add', AdminController.showAddPengasuh);
router.post('/pengasuh/add', AdminController.addPengasuh);
router.get('/pengasuh/edit/:id', AdminController.showEditPengasuh);
router.post('/pengasuh/edit/:id', AdminController.editPengasuh);
router.get('/pengasuh/delete/:id', AdminController.deletePengasuh);
router.get('/pengasuh/detail/:id', AdminController.showPengasuhDetail);

// Aktivitas Harian
router.get('/aktivitas', AdminController.showAktivitas);
router.get('/aktivitas/add', AdminController.showAddAktivitas);
router.post('/aktivitas/add', upload.single('foto'), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error_msg', 'Ukuran file terlalu besar. Maksimal 5MB.');
        } else {
            req.flash('error_msg', 'Terjadi kesalahan saat upload file.');
        }
        return res.redirect('/admin/aktivitas/add');
    } else if (err) {
        req.flash('error_msg', err.message);
        return res.redirect('/admin/aktivitas/add');
    }
    next();
}, AdminController.addAktivitas);
router.get('/aktivitas/edit/:id', AdminController.showEditAktivitas);
router.post('/aktivitas/edit/:id', upload.single('foto'), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error_msg', 'Ukuran file terlalu besar. Maksimal 5MB.');
        } else {
            req.flash('error_msg', 'Terjadi kesalahan saat upload file.');
        }
        return res.redirect(`/admin/aktivitas/edit/${req.params.id}`);
    } else if (err) {
        req.flash('error_msg', err.message);
        return res.redirect(`/admin/aktivitas/edit/${req.params.id}`);
    }
    next();
}, AdminController.editAktivitas);
router.get('/aktivitas/delete/:id', AdminController.deleteAktivitas);
router.get('/aktivitas/detail/:id', AdminController.showAktivitasDetail);

// Absensi Anak - Main routes
router.get('/absensi', AdminController.showAbsensi);
router.get('/absensi/add', AdminController.showAddAbsensi);
router.post('/absensi/add', AdminController.addAbsensi);
router.get('/absensi/detail', AdminController.showDetailAbsensi);
router.get('/absensi/edit', AdminController.showEditAbsensi);
router.post('/absensi/edit', AdminController.editAbsensi);
router.get('/absensi/delete/:date', AdminController.deleteAbsensi);

// Komunikasi ke Orang Tua
router.get('/komunikasi', AdminController.showKomunikasi);
router.get('/komunikasi/messages/:userId', AdminController.getChatMessages);
router.post('/komunikasi/send', AdminController.sendMessage);

// Notifikasi Darurat
router.get('/notifikasi-darurat', AdminController.showNotifikasiDarurat);
router.get('/notifikasi-darurat/add', AdminController.showAddNotifikasiDarurat);
router.post('/notifikasi-darurat/add', AdminController.addNotifikasiDarurat);
router.get('/notifikasi-darurat/edit/:id', AdminController.showEditNotifikasiDarurat);
router.post('/notifikasi-darurat/edit/:id', AdminController.editNotifikasiDarurat);
router.get('/notifikasi-darurat/delete/:id', AdminController.deleteNotifikasiDarurat);
router.get('/notifikasi-darurat/detail/:id', AdminController.showNotifikasiDaruratDetail);

// Kelola Tagihan & Pembayaran
router.get('/tagihan', AdminController.showTagihan);
router.get('/tagihan/detail/:periode', AdminController.showTagihanDetail);

// Test email route (only for development)
router.get('/test-email', requireAdmin, async (req, res) => {
    try {
        const emailService = require('../lib/emailService');
        const result = await emailService.testConnection();
        
        if (result.success) {
            req.flash('success_msg', 'Email service is working correctly!');
        } else {
            req.flash('error_msg', `Email service error: ${result.message}`);
        }
        
        res.redirect('/admin/dashboard');
    } catch (error) {
        req.flash('error_msg', `Email test failed: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;