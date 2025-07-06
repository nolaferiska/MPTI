const bcrypt = require('bcrypt');
const { User, Anak } = require('../models');

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
            // const { email, password } = req.body;
            const email = "user@example.com"
            const password = "123"; 
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

            // Create user
            const userData = {
                nama,
                email,
                password: hashedPassword,
                role: 'orang_tua',
                telepon: telepon || null,
                alamat: alamat || null,
                status: 'aktif'
            };

            const user = await User.create(userData);

            req.flash('success_msg', 'Registrasi berhasil! Silakan login.');
            res.redirect('/login');
        } catch (error) {
            console.error('Register error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat registrasi. Silakan coba lagi.');
            res.redirect('/register');
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

            const {
                nama,
                tanggalLahir,
                jenisKelamin,
                alamat,
                teleponDarurat,
                kondisiKesehatan,
                alergi
            } = req.body;

            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat) {
                req.flash('error_msg', 'Nama, tanggal lahir, jenis kelamin, dan alamat harus diisi');
                return res.redirect('/anak/register');
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