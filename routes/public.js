const express = require('express');
const router = express.Router();
const { redirectIfAuth } = require('../middleware/auth');
const { AuthController, PublicController, OrangTuaController } = require('../controllers');
const PaymentController = require('../controllers/PaymentController');
const upload = require('../middleware/uploadDokumenAnak');

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
// Forgot password
router.get('/forgot-password', PublicController.showForgotPassword);
router.post('/forgot-password', PublicController.processForgotPassword);
router.get('/reset-password/:token', PublicController.showResetPassword);
router.post('/reset-password/:token', PublicController.processResetPassword);

// Email verification routes
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Child registration page for orang tua
router.get('/anak/register', AuthController.showChildRegister);

// Process child registration for orang tua
router.post('/anak/register', upload.single('dokumenAnak'), AuthController.processChildRegister);
// Dashboard for orang tua (protected)
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