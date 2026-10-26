class PublicController {
    // Display homepage
    static showHome(req, res) {
        // Check for logout success message
        if (req.query.logout === 'success') {
            req.flash('success_msg', 'Logout berhasil');
        }
        
        res.render('public/index', {
            title: 'Candice Kids - Cerdas Mandiri Ceria',
            layout: 'layouts/public'
        });
    }

    // Display test Tailwind CSS page
    static showTestTailwind(req, res) {
        res.render('public/test-tailwind', {
            title: 'Test Tailwind CSS - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Display about page
    static showAbout(req, res) {
        res.render('public/about', {
            title: 'Tentang Kami - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Display contact page
    static showContact(req, res) {
        res.render('public/contact', {
            title: 'Kontak - Candice Kids',
            layout: 'layouts/public'
        });
    }
    
    // Tampilkan form lupa password
    static showForgotPassword(req, res) {
        res.render('public/forgot-password', {
            title: 'Lupa Password - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Proses request reset password
    static async processForgotPassword(req, res) {
        const { email } = req.body;
        const User = require('../models/User');
        const emailService = require('../lib/emailService');
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                req.flash('error_msg', 'Email tidak ditemukan');
                return res.redirect('/forgot-password');
            }
            const token = await user.generatePasswordResetToken();
            const baseUrl = process.env.BASE_URL || req.protocol + '://' + req.get('host');
            const resetUrl = `${baseUrl}/reset-password/${token}`;
            await emailService.sendPasswordResetEmail(user, resetUrl);
            req.flash('success_msg', 'Link reset password telah dikirim ke email Anda');
            res.redirect('/login');
        } catch (error) {
            console.error('Error processing forgot password:', error);
            req.flash('error_msg', 'Gagal mengirim email reset password');
            res.redirect('/forgot-password');
        }
    }

    // Tampilkan form reset password (akses via link email)
    static async showResetPassword(req, res) {
        const { token } = req.params;
        const User = require('../models/User');
        try {
            const user = await User.findByPasswordResetToken(token);
            if (!user) {
                req.flash('error_msg', 'Token reset password tidak valid atau sudah kadaluarsa');
                return res.redirect('/login');
            }
            res.render('public/reset-password', {
                title: 'Reset Password - Candice Kids',
                layout: 'layouts/public',
                token
            });
        } catch (error) {
            req.flash('error_msg', 'Gagal menampilkan form reset password');
            res.redirect('/login');
        }
    }

    // Proses update password
    static async processResetPassword(req, res) {
        const { token } = req.params;
        const { password } = req.body;
        const User = require('../models/User');
        try {
            const user = await User.findByPasswordResetToken(token);
            if (!user) {
                req.flash('error_msg', 'Token reset password tidak valid atau sudah kadaluarsa');
                return res.redirect('/login');
            }
            await user.resetPassword(password);
            req.flash('success_msg', 'Password berhasil direset, silakan login');
            res.redirect('/login');
        } catch (error) {
            req.flash('error_msg', 'Gagal reset password');
            res.redirect(`/reset-password/${token}`);
        }
    }
}

module.exports = PublicController;