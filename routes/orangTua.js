const express = require('express');
const router = express.Router();
const { requireOrangTua } = require('../middleware/auth');
const { OrangTuaController } = require('../controllers');
const PaymentController = require('../controllers/PaymentController');
const upload = require('../middleware/uploadDokumenAnak');
const path = require('path');

// Logout route (before protected)
router.get('/logout', OrangTuaController.logout);

// All routes below require authentication
router.use(requireOrangTua);

// Dashboard
router.get('/dashboard', OrangTuaController.showDashboard);

// Kelola Anak
router.get('/kelola-anak', OrangTuaController.showKelolaAnak);
router.get('/kelola-anak/add', OrangTuaController.showAddAnak);
router.post('/kelola-anak/add', upload.single('dokumenAnak'), OrangTuaController.addAnak);
router.get('/kelola-anak/detail/:id', OrangTuaController.showAnakDetail);
router.get('/kelola-anak/edit/:id', OrangTuaController.showEditAnak);
router.post('/kelola-anak/edit/:id', upload.single('dokumenAnak'), OrangTuaController.editAnak);
router.get('/kelola-anak/delete/:id', OrangTuaController.deleteAnak);

// Absen Anak
router.get('/absen', OrangTuaController.showAbsen);
router.get('/absen/detail/:id', OrangTuaController.showAbsenDetail);

// Aktivitas Harian
router.get('/aktivitas', OrangTuaController.showAktivitas);
router.get('/aktivitas/detail/:id', OrangTuaController.showAktivitasDetail);

// Notifikasi Darurat
router.get('/notifikasi', OrangTuaController.showNotifikasi);
router.get('/notifikasi/detail/:id', OrangTuaController.showNotifikasiDetail);

// Tagihan & Pembayaran
router.get('/tagihan', PaymentController.showTagihan);
router.get('/tagihan/anak/:anakId', PaymentController.showTagihanAnak);
router.post('/payment/create', PaymentController.createPayment);

// Komunikasi
router.get('/komunikasi', OrangTuaController.showKomunikasi);
router.get('/komunikasi/messages/:adminId', OrangTuaController.getChatMessages);
router.post('/komunikasi/send', OrangTuaController.sendMessage);
// Chat dengan Admin (legacy route)
router.get('/chat', OrangTuaController.showKomunikasi);

// Download Template Form
router.get('/template/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../public/template', filename);
    res.download(filePath, filename);
});

module.exports = router;