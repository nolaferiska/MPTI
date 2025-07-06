const express = require('express');
const router = express.Router();
const { requireOrangTua } = require('../middleware/auth');
const { OrangTuaController } = require('../controllers');

// Orang tua logout
router.get('/logout', OrangTuaController.logout);

// Protected orang tua routes
router.use(requireOrangTua);

// Dashboard Orang Tua
router.get('/dashboard', OrangTuaController.showDashboard);

// Absen Anak
router.get('/absen', OrangTuaController.showAbsen);

// Aktivitas Harian
router.get('/aktivitas', OrangTuaController.showAktivitas);
router.get('/aktivitas/detail/:id', OrangTuaController.showAktivitasDetail);

// Communication
router.get('/komunikasi', OrangTuaController.showKomunikasi);
router.get('/komunikasi/messages/:adminId', OrangTuaController.getChatMessages);
router.post('/komunikasi/send', OrangTuaController.sendMessage);

// Chat dengan Admin (legacy route)
router.get('/chat', OrangTuaController.showChat);

// Tagihan & Pembayaran
router.get('/tagihan', OrangTuaController.showTagihan);

// Notifikasi Darurat
router.get('/notifikasi', OrangTuaController.showNotifikasi);

module.exports = router;