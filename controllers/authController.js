const bcrypt = require('bcrypt');
const { User, Anak } = require('../models');
const emailService = require('../lib/emailService');

class AuthController {
    // Display login page
    static showLogin(req, res) {
        res.render('public/login', {
            title: 'Login Orang Tua - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Process login
    static async processLogin(req, res) {
        try {
            const { email, password } = req.body;
            // const email = "user@example.com"
            // const password = "123"; 
            // Validate input
            if (!email || !password) {
                req.flash('error_msg', 'Email dan password harus diisi');
                return res.redirect('/login');
            }

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                req.flash('error_msg', 'Email atau password salah');
                return res.redirect('/login');
            }

            // Check if email is verified
            if (!user.isEmailVerified()) {
                req.flash('error_msg', 'Email Anda belum diverifikasi. Silakan cek email Anda dan klik link verifikasi.');
                return res.redirect('/login');
            }

            // Check if user is active
            if (!user.isActive()) {
                req.flash('error_msg', 'Akun Anda telah dinonaktifkan. Hubungi admin untuk bantuan.');
                return res.redirect('/login');
            }

            // Check if user is orang tua
            if (!user.isOrangTua()) {
                req.flash('error_msg', 'Email atau password salah');
                return res.redirect('/login');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                req.flash('error_msg', 'Email atau password salah');
                return res.redirect('/login');
            }

            // Set session
            req.session.user = user.toJSON();

            // Check if orang tua has registered children
            const children = await Anak.findByOrangTua(user.id);

            if (children.length === 0) {
                // No children registered, redirect to child registration form
                req.flash('info_msg', 'Selamat datang! Silakan daftarkan anak Anda terlebih dahulu.');
                res.redirect('/anak/register');
            } else {
                // Has children, proceed to dashboard
                req.flash('success_msg', 'Login berhasil! Selamat datang kembali.');
                res.redirect('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat login. Silakan coba lagi.');
            res.redirect('/login');
        }
    }

    // Display register page
    static showRegister(req, res) {
        res.render('public/register', {
            title: 'Daftar Orang Tua - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Process registration
    static async processRegister(req, res) {
        try {
            const { nama, email, password, confirmPassword, telepon, alamat } = req.body;

            // Validate input
            if (!nama || !email || !password || !confirmPassword) {
                req.flash('error_msg', 'Semua field harus diisi');
                return res.redirect('/register');
            }

            if (password !== confirmPassword) {
                req.flash('error_msg', 'Password tidak cocok');
                return res.redirect('/register');
            }

            if (password.length < 6) {
                req.flash('error_msg', 'Password minimal 6 karakter');
                return res.redirect('/register');
            }

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                req.flash('error_msg', 'Email sudah terdaftar');
                return res.redirect('/register');
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user with pending status
            const userData = {
                nama,
                email,
                password: hashedPassword,
                role: 'orang_tua',
                telepon: telepon || null,
                alamat: alamat || null
            };

            const user = await User.create(userData);

            // Send verification email
            try {
                const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
                const verificationUrl = `${baseUrl}/verify-email/${user.emailVerificationToken}`;
                await emailService.sendVerificationEmail(user, verificationUrl);

                req.flash('success_msg', 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.');
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                req.flash('warning_msg', 'Registrasi berhasil, tetapi gagal mengirim email verifikasi. Silakan hubungi admin.');
            }

            res.redirect('/login');
        } catch (error) {
            console.error('Register error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat registrasi. Silakan coba lagi.');
            res.redirect('/register');
        }
    }

    // Verify email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            if (!token) {
                req.flash('error_msg', 'Token verifikasi tidak valid');
                return res.redirect('/login');
            }

            const user = await User.verifyEmail(token);

            if (user) {
                // Send welcome email
                try {
                    await emailService.sendWelcomeEmail(user);
                } catch (emailError) {
                    console.error('Welcome email error:', emailError);
                }

                // Render success page instead of redirecting
                res.render('public/verification-success', {
                    title: 'Verifikasi Email Berhasil - Candice Kids',
                    layout: 'layouts/public'
                });
            } else {
                req.flash('error_msg', 'Token verifikasi tidak valid atau sudah kadaluarsa');
                res.redirect('/login');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat verifikasi email. Silakan coba lagi.');
            res.redirect('/login');
        }
    }

    // Resend verification email
    static async resendVerification(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                req.flash('error_msg', 'Email harus diisi');
                return res.redirect('/login');
            }

            const user = await User.findByEmail(email);
            if (!user) {
                req.flash('error_msg', 'Email tidak ditemukan');
                return res.redirect('/login');
            }

            if (user.isEmailVerified()) {
                req.flash('info_msg', 'Email Anda sudah diverifikasi. Silakan login.');
                return res.redirect('/login');
            }

            // Generate new verification token
            await user.resendVerificationEmail();

            // Send new verification email
            try {
                const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
                const verificationUrl = `${baseUrl}/verify-email/${user.emailVerificationToken}`;
                await emailService.sendVerificationEmail(user, verificationUrl);

                req.flash('success_msg', 'Email verifikasi telah dikirim ulang. Silakan cek email Anda.');
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                req.flash('error_msg', 'Gagal mengirim email verifikasi. Silakan coba lagi.');
            }

            res.redirect('/login');
        } catch (error) {
            console.error('Resend verification error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat mengirim ulang email verifikasi.');
            res.redirect('/login');
        }
    }

    // Logout
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            // Redirect with query parameter for success message
            res.redirect('/?logout=success');
        });
    }

    // Show child registration form for parents
    static showChildRegister(req, res) {
        // Check if user is logged in
        if (!req.session.user) {
            req.flash('error_msg', 'Silakan login terlebih dahulu');
            return res.redirect('/login');
        }

        res.render('orangtua/child-register', {
            title: 'Daftarkan Anak - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Process child registration for parents
    static async processChildRegister(req, res) {
        try {
            // Check if user is logged in
            if (!req.session.user) {
                req.flash('error_msg', 'Silakan login terlebih dahulu');
                return res.redirect('/login');
            }
            console.log(req.body);

            const {
                nama,
                tanggalLahir,
                jenisKelamin,
                alamat,
                teleponDarurat,
                kondisiKesehatan,
                alergi
            } = req.body;

            const dokumenAnak = req.file ? `/uploads/dokumen-anak/${req.file.filename}` : null;
            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat) {
                req.flash('error_msg', 'Nama, tanggal lahir, jenis kelamin, dan alamat harus diisi');
                return res.redirect('/anak/register');
            }
            if (!req.file) {
                req.flash('error_msg', 'Dokumen form anak wajib diupload');
                return res.redirect('/kelola-anak/add');
            }
            // Create child data
            const anakData = {
                nama,
                tanggalLahir: new Date(tanggalLahir),
                jenisKelamin,
                alamat,
                teleponDarurat: teleponDarurat || null,
                kondisiKesehatan: kondisiKesehatan || null,
                alergi: alergi || null,
                orangTuaId: req.session.user.id,
                tanggalMasuk: new Date(),
                dokumenAnak,
                status: 'aktif'
            };

            await Anak.create(anakData);
            req.flash('success_msg', 'Data anak berhasil didaftarkan! Selamat datang di Candice Kids.');
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Error registering child:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat mendaftarkan anak. Silakan coba lagi.');
            res.redirect('/anak/register');
        }
    }
}

module.exports = AuthController;