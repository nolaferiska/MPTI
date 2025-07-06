const express = require('express');
const router = express.Router();
const { redirectIfAuth, requireOrangTua } = require('../middleware/auth');
const { AuthController, PublicController, OrangTuaController } = require('../controllers');
const PaymentController = require('../controllers/PaymentController');

// Homepage
router.get('/', PublicController.showHome);


// Login page for orang tua
router.get('/login', redirectIfAuth(), AuthController.showLogin);

// Process login for orang tua
router.post('/login', redirectIfAuth(), AuthController.processLogin);

// Register page for orang tua
router.get('/register', redirectIfAuth(), AuthController.showRegister);

// Process register for orang tua
router.post('/register', redirectIfAuth(), AuthController.processRegister);

// Child registration page for orang tua
router.get('/anak/register', AuthController.showChildRegister);

// Process child registration for orang tua
router.post('/anak/register', AuthController.processChildRegister);

// Dashboard for orang tua (protected)
router.get('/dashboard', requireOrangTua, OrangTuaController.showDashboard);

// Kelola Anak routes for orang tua (protected)
router.get('/kelola-anak', requireOrangTua, OrangTuaController.showKelolaAnak);
router.get('/kelola-anak/add', requireOrangTua, OrangTuaController.showAddAnak);
router.post('/kelola-anak/add', requireOrangTua, OrangTuaController.addAnak);
router.get('/kelola-anak/detail/:id', requireOrangTua, OrangTuaController.showAnakDetail);
router.get('/kelola-anak/edit/:id', requireOrangTua, OrangTuaController.showEditAnak);
router.post('/kelola-anak/edit/:id', requireOrangTua, OrangTuaController.editAnak);
router.get('/kelola-anak/delete/:id', requireOrangTua, OrangTuaController.deleteAnak);

// Absen Anak routes for orang tua (protected)
router.get('/absen', requireOrangTua, OrangTuaController.showAbsen);
router.get('/absen/detail/:id', requireOrangTua, OrangTuaController.showAbsenDetail);

// Komunikasi routes for orang tua (protected)
router.get('/komunikasi', requireOrangTua, OrangTuaController.showKomunikasi);
router.get('/komunikasi/messages/:adminId', requireOrangTua, OrangTuaController.getChatMessages);
router.post('/komunikasi/send', requireOrangTua, OrangTuaController.sendMessage);

// Aktivitas routes for orang tua (protected)
router.get('/aktivitas', requireOrangTua, OrangTuaController.showAktivitas);
router.get('/aktivitas/detail/:id', requireOrangTua, OrangTuaController.showAktivitasDetail);

// Notifikasi Darurat routes for orang tua (protected)
router.get('/notifikasi', requireOrangTua, OrangTuaController.showNotifikasi);
router.get('/notifikasi/detail/:id', requireOrangTua, OrangTuaController.showNotifikasiDetail);

// Payment routes for orang tua (protected)
router.get('/tagihan', requireOrangTua, PaymentController.showTagihan);
router.get('/tagihan/anak/:anakId', requireOrangTua, PaymentController.showTagihanAnak);
router.post('/payment/create', requireOrangTua, PaymentController.createPayment);
router.get('/payment/finish', PaymentController.paymentFinish);
router.get('/payment/unfinish', PaymentController.paymentPending);
router.get('/payment/error', PaymentController.paymentError);

// Midtrans webhook (no auth required)
router.post('/payment/notification', PaymentController.paymentNotification);

// Logout
router.get('/logout', AuthController.logout);

// About page
router.get('/about', PublicController.showAbout);

// Contact page
router.get('/contact', PublicController.showContact);

module.exports = router;