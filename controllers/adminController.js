const bcrypt = require('bcrypt');
const { User, Anak, Pengasuh, Absensi, Aktivitas, Komunikasi, NotifikasiDarurat, Tagihan, Pembayaran } = require('../models');
const prisma = require('../lib/prisma');
const emailService = require('../lib/emailService');

class AdminController {
    // Display admin login page
    static showLogin(req, res) {
        // Check for logout success message
        if (req.query.logout === 'success') {
            req.flash('success_msg', 'Logout berhasil');
        }
        
        res.render('admin/login', {
            title: 'Login Admin - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Process admin login
    static async processLogin(req, res) {
        try {
            const { username, password } = req.body;
            // const username = "admin"
            // const password = "123"
                // Validate input
            if (!username || !password) {
                req.flash('error_msg', 'Username dan password harus diisi');
                return res.redirect('/admin/login');
            }

            // Find user by username
            const user = await User.findByUsername(username);
            if (!user) {
                req.flash('error_msg', 'Username atau password salah');
                return res.redirect('/admin/login');
            }

            // Check if user is active
            if (!user.isActive()) {
                req.flash('error_msg', 'Akun admin telah dinonaktifkan.');
                return res.redirect('/admin/login');
            }

            // Check if user is admin
            if (!user.isAdmin()) {
                req.flash('error_msg', 'Username atau password salah');
                return res.redirect('/admin/login');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                req.flash('error_msg', 'Username atau password salah');
                return res.redirect('/admin/login');
            }

            // Set session
            req.session.user = user.toJSON();
            req.flash('success_msg', 'Login admin berhasil! Selamat datang kembali.');

            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Admin login error:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat login. Silakan coba lagi.');
            res.redirect('/admin/login');
        }
    }

    // Display admin dashboard
    static showDashboard(req, res) {
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - Candice Kids',
            layout: 'layouts/admin'
        });
    }

    // Display anak management page
    static async showAnak(req, res) {
        try {
            const { search, status, page = 1, limit = 10 } = req.query;

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { alamat: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status && status !== 'all') {
                where.status = status;
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get anak data with pagination
            const anakList = await Anak.findAll({
                where,
                include: { orangTua: true },
                skip,
                take: parseInt(limit)
            });

            // Get total count for pagination
            const totalAnak = await Anak.findAll({ where });
            const totalPages = Math.ceil(totalAnak.length / parseInt(limit));

            res.render('admin/anak', {
                title: 'Kelola Data Anak - Candice Kids',
                layout: 'layouts/admin',
                anakList,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search, status }
            });
        } catch (error) {
            console.error('Error loading anak data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data anak');
            res.redirect('/admin/dashboard');
        }
    }

    // Show add anak form
    static async showAddAnak(req, res) {
        try {
            const orangTuaList = await User.findByRole('orang_tua');
            res.render('admin/anak/add', {
                title: 'Tambah Data Anak - Candice Kids',
                layout: 'layouts/admin',
                orangTuaList
            });
        } catch (error) {
            console.error('Error loading add anak form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/anak');
        }
    }

    // Process add anak
    static async addAnak(req, res) {
        try {
            const {
                nama,
                tanggalLahir,
                jenisKelamin,
                alamat,
                teleponDarurat,
                kondisiKesehatan,
                alergi,
                orangTuaId,
                tanggalMasuk
            } = req.body;

            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat || !orangTuaId) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect('/admin/anak/add');
            }

            // Create anak data
            const anakData = {
                nama,
                tanggalLahir: new Date(tanggalLahir),
                jenisKelamin,
                alamat,
                teleponDarurat: teleponDarurat || null,
                kondisiKesehatan: kondisiKesehatan || null,
                alergi: alergi || null,
                orangTuaId: parseInt(orangTuaId),
                tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : new Date(),
                status: 'aktif'
            };

            await Anak.create(anakData);
            req.flash('success_msg', 'Data anak berhasil ditambahkan');
            res.redirect('/admin/anak');
        } catch (error) {
            console.error('Error adding anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menambah data anak');
            res.redirect('/admin/anak/add');
        }
    }

    // Show edit anak form
    static async showEditAnak(req, res) {
        try {
            const { id } = req.params;
            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/admin/anak');
            }

            const orangTuaList = await User.findByRole('orang_tua');

            res.render('admin/anak/edit', {
                title: 'Edit Data Anak - Candice Kids',
                layout: 'layouts/admin',
                anak,
                orangTuaList
            });
        } catch (error) {
            console.error('Error loading edit anak form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/anak');
        }
    }

    // Process edit anak
    static async editAnak(req, res) {
        try {
            const { id } = req.params;
            const {
                nama,
                tanggalLahir,
                jenisKelamin,
                alamat,
                teleponDarurat,
                kondisiKesehatan,
                alergi,
                orangTuaId,
                tanggalMasuk,
                status
            } = req.body;

            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat || !orangTuaId) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect(`/admin/anak/edit/${id}`);
            }

            const anak = await Anak.findById(id);
            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/admin/anak');
            }

            // Update anak data
            const updateData = {
                nama,
                tanggalLahir: new Date(tanggalLahir),
                jenisKelamin,
                alamat,
                teleponDarurat: teleponDarurat || null,
                kondisiKesehatan: kondisiKesehatan || null,
                alergi: alergi || null,
                orangTuaId: parseInt(orangTuaId),
                tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : anak.tanggalMasuk,
                status
            };

            await anak.update(updateData);
            req.flash('success_msg', 'Data anak berhasil diperbarui');
            res.redirect('/admin/anak');
        } catch (error) {
            console.error('Error updating anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui data anak');
            res.redirect(`/admin/anak/edit/${req.params.id}`);
        }
    }

    // Delete anak
    static async deleteAnak(req, res) {
        try {
            const { id } = req.params;
            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/admin/anak');
            }

            await anak.delete();
            req.flash('success_msg', 'Data anak berhasil dihapus');
            res.redirect('/admin/anak');
        } catch (error) {
            console.error('Error deleting anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus data anak');
            res.redirect('/admin/anak');
        }
    }

    // Show anak detail
    static async showAnakDetail(req, res) {
        try {
            const { id } = req.params;
            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/admin/anak');
            }

            // Get related data
            const attendanceStats = await anak.getAttendanceStats();
            const recentAttendance = await anak.getAttendanceRecords({ take: 5 });
            // Activities are now general, not child-specific

            res.render('admin/anak/detail', {
                title: `Detail ${anak.nama} - Candice Kids`,
                layout: 'layouts/admin',
                anak,
                attendanceStats,
                recentAttendance
            });
        } catch (error) {
            console.error('Error loading anak detail:', error);
            req.flash('error_msg', error.message);
            res.redirect('/admin/anak');
        }
    }

    // Display pengasuh management page
    static async showPengasuh(req, res) {
        try {
            const { search, status, page = 1, limit = 10 } = req.query;

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { alamat: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (status && status !== 'all') {
                where.status = status;
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get pengasuh data with pagination
            const pengasuhList = await Pengasuh.findAll({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { nama: 'asc' }
            });

            // Get total count for pagination
            const totalPengasuh = await Pengasuh.findAll({ where });
            const totalPages = Math.ceil(totalPengasuh.length / parseInt(limit));

            res.render('admin/pengasuh', {
                title: 'Kelola Data Pengasuh - Candice Kids',
                layout: 'layouts/admin',
                pengasuhList,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search, status }
            });
        } catch (error) {
            console.error('Error loading pengasuh data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data pengasuh');
            res.redirect('/admin/dashboard');
        }
    }

    // Show add pengasuh form
    static async showAddPengasuh(req, res) {
        try {
            res.render('admin/pengasuh/add', {
                title: 'Tambah Data Pengasuh - Candice Kids',
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Error loading add pengasuh form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/pengasuh');
        }
    }

    // Process add pengasuh
    static async addPengasuh(req, res) {
        try {
            const {
                nama,
                email,
                telepon,
                alamat,
                tanggalLahir,
                jenisKelamin,
                pendidikan,
                pengalaman,
                tanggalBergabung
            } = req.body;

            // Validate required fields
            if (!nama || !email || !telepon || !alamat || !jenisKelamin) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect('/admin/pengasuh/add');
            }

            // Check if email already exists
            const existingPengasuh = await Pengasuh.findByEmail(email);
            if (existingPengasuh) {
                req.flash('error_msg', 'Email sudah terdaftar');
                return res.redirect('/admin/pengasuh/add');
            }

            // Create pengasuh data
            const pengasuhData = {
                nama,
                email,
                telepon,
                alamat,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                jenisKelamin,
                pendidikan: pendidikan || null,
                pengalaman: pengalaman || null,
                tanggalBergabung: tanggalBergabung ? new Date(tanggalBergabung) : new Date(),
                status: 'aktif'
            };

            await Pengasuh.create(pengasuhData);
            req.flash('success_msg', 'Data pengasuh berhasil ditambahkan');
            res.redirect('/admin/pengasuh');
        } catch (error) {
            console.error('Error adding pengasuh:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menambah data pengasuh');
            res.redirect('/admin/pengasuh/add');
        }
    }

    // Show edit pengasuh form
    static async showEditPengasuh(req, res) {
        try {
            const { id } = req.params;
            const pengasuh = await Pengasuh.findById(id);

            if (!pengasuh) {
                req.flash('error_msg', 'Data pengasuh tidak ditemukan');
                return res.redirect('/admin/pengasuh');
            }

            res.render('admin/pengasuh/edit', {
                title: 'Edit Data Pengasuh - Candice Kids',
                layout: 'layouts/admin',
                pengasuh
            });
        } catch (error) {
            console.error('Error loading edit pengasuh form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/pengasuh');
        }
    }

    // Process edit pengasuh
    static async editPengasuh(req, res) {
        try {
            const { id } = req.params;
            const {
                nama,
                email,
                telepon,
                alamat,
                tanggalLahir,
                jenisKelamin,
                pendidikan,
                pengalaman,
                tanggalBergabung,
                status
            } = req.body;

            // Validate required fields
            if (!nama || !email || !telepon || !alamat || !jenisKelamin) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect(`/admin/pengasuh/edit/${id}`);
            }

            const pengasuh = await Pengasuh.findById(id);
            if (!pengasuh) {
                req.flash('error_msg', 'Data pengasuh tidak ditemukan');
                return res.redirect('/admin/pengasuh');
            }

            // Check if email already exists (excluding current pengasuh)
            const existingPengasuh = await Pengasuh.findByEmail(email);
            if (existingPengasuh && existingPengasuh.id !== parseInt(id)) {
                req.flash('error_msg', 'Email sudah terdaftar');
                return res.redirect(`/admin/pengasuh/edit/${id}`);
            }

            // Update pengasuh data
            const updateData = {
                nama,
                email,
                telepon,
                alamat,
                tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
                jenisKelamin,
                pendidikan: pendidikan || null,
                pengalaman: pengalaman || null,
                tanggalBergabung: tanggalBergabung ? new Date(tanggalBergabung) : pengasuh.tanggalBergabung,
                status
            };

            await pengasuh.update(updateData);
            req.flash('success_msg', 'Data pengasuh berhasil diperbarui');
            res.redirect('/admin/pengasuh');
        } catch (error) {
            console.error('Error updating pengasuh:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui data pengasuh');
            res.redirect(`/admin/pengasuh/edit/${req.params.id}`);
        }
    }

    // Delete pengasuh
    static async deletePengasuh(req, res) {
        try {
            const { id } = req.params;
            const pengasuh = await Pengasuh.findById(id);

            if (!pengasuh) {
                req.flash('error_msg', 'Data pengasuh tidak ditemukan');
                return res.redirect('/admin/pengasuh');
            }

            await pengasuh.delete();
            req.flash('success_msg', 'Data pengasuh berhasil dihapus');
            res.redirect('/admin/pengasuh');
        } catch (error) {
            console.error('Error deleting pengasuh:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus data pengasuh');
            res.redirect('/admin/pengasuh');
        }
    }

    // Show pengasuh detail
    static async showPengasuhDetail(req, res) {
        try {
            const { id } = req.params;
            const pengasuh = await Pengasuh.findById(id);

            if (!pengasuh) {
                req.flash('error_msg', 'Data pengasuh tidak ditemukan');
                return res.redirect('/admin/pengasuh');
            }

            // Get related data
            const children = await pengasuh.getChildren();
            // Activities are now general, not pengasuh-specific
            const recentActivities = await pengasuh.getActivities({ take: 5 });

            res.render('admin/pengasuh/detail', {
                title: `Detail ${pengasuh.nama} - Candice Kids`,
                layout: 'layouts/admin',
                pengasuh,
                children,
                recentActivities
            });
        } catch (error) {
            console.error('Error loading pengasuh detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail pengasuh');
            res.redirect('/admin/pengasuh');
        }
    }

    // Display aktivitas management page
    static async showAktivitas(req, res) {
        try {
            const { search, date, page = 1, limit = 10 } = req.query;
            const selectedDate = date ? new Date(date) : new Date();

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { namaAktivitas: { contains: search, mode: 'insensitive' } },
                    { deskripsi: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (date) {
                where.tanggal = selectedDate;
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get aktivitas data with pagination
            const aktivitasList = await Aktivitas.findAll({
                where,
                skip,
                take: parseInt(limit)
            });

            // Get total count for pagination
            const totalAktivitas = await Aktivitas.findAll({ where });
            const totalPages = Math.ceil(totalAktivitas.length / parseInt(limit));

            // Get today's summary
            const todaySummary = await Aktivitas.getDailySummary(selectedDate);

            res.render('admin/aktivitas', {
                title: 'Kelola Aktivitas Harian - Candice Kids',
                layout: 'layouts/admin',
                aktivitasList,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search, date },
                selectedDate,
                todaySummary
            });
        } catch (error) {
            console.error('Error loading aktivitas data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data aktivitas');
            res.redirect('/admin/dashboard');
        }
    }

    // Show add aktivitas form
    static async showAddAktivitas(req, res) {
        try {
            res.render('admin/aktivitas/add', {
                title: 'Tambah Aktivitas - Candice Kids',
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Error loading add aktivitas form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/aktivitas');
        }
    }

    // Process add aktivitas
    static async addAktivitas(req, res) {
        try {
            const {
                tanggal,
                namaAktivitas,
                deskripsi,
                waktuMulai,
                waktuSelesai
            } = req.body;

            // Validate required fields
            if (!tanggal || !namaAktivitas || !deskripsi) {
                req.flash('error_msg', 'Tanggal, nama aktivitas, dan deskripsi wajib diisi');
                return res.redirect('/admin/aktivitas/add');
            }

            // Handle file upload
            let foto = null;
            if (req.file) {
                // For now, we'll just store the filename
                // In a real application, you'd want to process and store the image properly
                foto = `/uploads/aktivitas/${req.file.filename}`;
            }

            // Create aktivitas data
            const aktivitasData = {
                tanggal: new Date(tanggal),
                namaAktivitas,
                deskripsi,
                waktuMulai: waktuMulai ? new Date(`2000-01-01T${waktuMulai}`) : null,
                waktuSelesai: waktuSelesai ? new Date(`2000-01-01T${waktuSelesai}`) : null,
                foto
            };

            await Aktivitas.create(aktivitasData);
            req.flash('success_msg', 'Aktivitas berhasil ditambahkan');
            res.redirect('/admin/aktivitas');
        } catch (error) {
            console.error('Error adding aktivitas:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menambah aktivitas');
            res.redirect('/admin/aktivitas/add');
        }
    }

    // Show edit aktivitas form
    static async showEditAktivitas(req, res) {
        try {
            const { id } = req.params;
            const aktivitas = await Aktivitas.findById(id);

            if (!aktivitas) {
                req.flash('error_msg', 'Data aktivitas tidak ditemukan');
                return res.redirect('/admin/aktivitas');
            }

            res.render('admin/aktivitas/edit', {
                title: 'Edit Aktivitas - Candice Kids',
                layout: 'layouts/admin',
                aktivitas
            });
        } catch (error) {
            console.error('Error loading edit aktivitas form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/aktivitas');
        }
    }

    // Process edit aktivitas
    static async editAktivitas(req, res) {
        try {
            const { id } = req.params;
            const {
                tanggal,
                namaAktivitas,
                deskripsi,
                waktuMulai,
                waktuSelesai
            } = req.body;

            // Validate required fields
            if (!tanggal || !namaAktivitas || !deskripsi) {
                req.flash('error_msg', 'Tanggal, nama aktivitas, dan deskripsi wajib diisi');
                return res.redirect(`/admin/aktivitas/edit/${id}`);
            }

            const aktivitas = await Aktivitas.findById(id);
            if (!aktivitas) {
                req.flash('error_msg', 'Data aktivitas tidak ditemukan');
                return res.redirect('/admin/aktivitas');
            }

            // Handle file upload
            let foto = aktivitas.foto; // Keep existing photo if no new file
            if (req.file) {
                // For now, we'll just store the filename
                // In a real application, you'd want to process and store the image properly
                foto = `/uploads/aktivitas/${req.file.filename}`;
            }

            // Update aktivitas data
            const updateData = {
                tanggal: new Date(tanggal),
                namaAktivitas,
                deskripsi,
                waktuMulai: waktuMulai ? new Date(`2000-01-01T${waktuMulai}`) : null,
                waktuSelesai: waktuSelesai ? new Date(`2000-01-01T${waktuSelesai}`) : null,
                foto
            };

            await aktivitas.update(updateData);
            req.flash('success_msg', 'Aktivitas berhasil diperbarui');
            res.redirect('/admin/aktivitas');
        } catch (error) {
            console.error('Error updating aktivitas:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui aktivitas');
            res.redirect(`/admin/aktivitas/edit/${req.params.id}`);
        }
    }

    // Delete aktivitas
    static async deleteAktivitas(req, res) {
        try {
            const { id } = req.params;
            const aktivitas = await Aktivitas.findById(id);

            if (!aktivitas) {
                req.flash('error_msg', 'Data aktivitas tidak ditemukan');
                return res.redirect('/admin/aktivitas');
            }

            await aktivitas.delete();
            req.flash('success_msg', 'Aktivitas berhasil dihapus');
            res.redirect('/admin/aktivitas');
        } catch (error) {
            console.error('Error deleting aktivitas:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus aktivitas');
            res.redirect('/admin/aktivitas');
        }
    }

    // Show aktivitas detail
    static async showAktivitasDetail(req, res) {
        try {
            const { id } = req.params;
            const aktivitas = await Aktivitas.findById(id);

            if (!aktivitas) {
                req.flash('error_msg', 'Data aktivitas tidak ditemukan');
                return res.redirect('/admin/aktivitas');
            }

            res.render('admin/aktivitas/detail', {
                title: `Detail Aktivitas - Candice Kids`,
                layout: 'layouts/admin',
                aktivitas
            });
        } catch (error) {
            console.error('Error loading aktivitas detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail aktivitas');
            res.redirect('/admin/aktivitas');
        }
    }

    // Display absensi management page
    static async showAbsensi(req, res) {
        try {
            // Get all dates with attendance data
            const attendanceDates = await Absensi.getAllAttendanceDates();

            // Get summary for each date
            const attendanceSummary = [];
            for (const date of attendanceDates) {
                const summary = await Absensi.getDailySummary(date);
                attendanceSummary.push(summary);
            }

            res.render('admin/absensi', {
                title: 'Rekap Absensi Anak - Candice Kids',
                layout: 'layouts/admin',
                attendanceSummary
            });
        } catch (error) {
            console.error('Error loading absensi data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data absensi');
            res.redirect('/admin/dashboard');
        }
    }

    // Show add absensi form
    static async showAddAbsensi(req, res) {
        try {
            const { date } = req.query;
            const selectedDate = date ? new Date(date) : new Date();

            // Get all active children
            const children = await Anak.findAll({
                where: { status: 'aktif' },
                include: { orangTua: true },
                orderBy: { nama: 'asc' }
            });

            // Get existing attendance for the date
            const existingAttendance = await Absensi.findAll({
                where: { tanggal: selectedDate },
                include: { anak: true },
                orderBy: [
                    { anak: { nama: 'asc' } }
                ]
            });

            // Create a map of existing attendance
            const attendanceMap = {};
            existingAttendance.forEach(att => {
                attendanceMap[att.anakId] = att;
            });

            res.render('admin/absensi/add', {
                title: 'Tambah Absensi - Candice Kids',
                layout: 'layouts/admin',
                selectedDate,
                children,
                existingAttendance: attendanceMap
            });
        } catch (error) {
            console.error('Error loading add absensi form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/absensi');
        }
    }

    // Process add absensi
    static async addAbsensi(req, res) {
        try {
            const { tanggal, absensiData } = req.body;

            console.log('Raw request body:', req.body);
            console.log('Tanggal:', tanggal);
            console.log('AbsensiData type:', typeof absensiData);
            console.log('AbsensiData:', absensiData);

            if (!tanggal || !absensiData) {
                req.flash('error_msg', 'Data absensi tidak lengkap');
                return res.redirect('/admin/absensi/add');
            }

            const selectedDate = new Date(tanggal);
            const userId = req.session.user.id;

            console.log('Processing attendance data:', { tanggal, absensiData, userId });

            // Handle both array and object formats
            let attendanceEntries;
            if (Array.isArray(absensiData)) {
                // Convert array to object format
                attendanceEntries = absensiData.map((item, index) => [index.toString(), item]);
            } else {
                // Use object entries directly
                attendanceEntries = Object.entries(absensiData);
            }

            // Process each child's attendance
            for (const [anakId, data] of attendanceEntries) {
                const { status, anakId: explicitAnakId } = data;
                const finalAnakId = explicitAnakId || anakId;

                console.log('Processing attendance for anakId:', finalAnakId, 'status:', status);

                if (!finalAnakId || finalAnakId === '0') {
                    console.log('Skipping invalid anakId:', finalAnakId);
                    continue;
                }

                // Check if attendance already exists for this child and date
                const existingAttendance = await Absensi.findByAnakAndDate(finalAnakId, selectedDate);

                if (existingAttendance) {
                    // Update existing attendance
                    await existingAttendance.update({
                        status
                    });
                } else {
                    // Create new attendance
                    const attendanceData = {
                        anakId: parseInt(finalAnakId),
                        tanggal: selectedDate,
                        status,
                        createdBy: userId
                    };
                    console.log('Creating attendance with data:', attendanceData);
                    await Absensi.create(attendanceData);
                }
            }

            req.flash('success_msg', 'Data absensi berhasil disimpan');
            res.redirect('/admin/absensi');
        } catch (error) {
            console.error('Error adding absensi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menyimpan data absensi');
            res.redirect('/admin/absensi/add');
        }
    }

    // Show detail absensi
    static async showDetailAbsensi(req, res) {
        try {
            const { date } = req.query;
            const selectedDate = date ? new Date(date) : new Date();

            // Get attendance summary for the selected date
            const attendanceSummary = await Absensi.getDailySummary(selectedDate);

            // Get all active children
            const children = await Anak.findAll({
                where: { status: 'aktif' },
                include: { orangTua: true },
                orderBy: { nama: 'asc' }
            });

            // Get existing attendance for the date
            const existingAttendance = await Absensi.findAll({
                where: { tanggal: selectedDate },
                include: { anak: true },
                orderBy: [
                    { anak: { nama: 'asc' } }
                ]
            });

            // Create a map of existing attendance
            const attendanceMap = {};
            existingAttendance.forEach(att => {
                attendanceMap[att.anakId] = att;
            });

            res.render('admin/absensi/detail', {
                title: 'Detail Absensi - Candice Kids',
                layout: 'layouts/admin',
                selectedDate,
                attendanceSummary,
                children,
                existingAttendance: attendanceMap
            });
        } catch (error) {
            console.error('Error loading detail absensi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail absensi');
            res.redirect('/admin/absensi');
        }
    }

    // Show edit absensi form
    static async showEditAbsensi(req, res) {
        try {
            const { date } = req.query;
            const selectedDate = date ? new Date(date) : new Date();

            // Get all active children
            const children = await Anak.findAll({
                where: { status: 'aktif' },
                include: { orangTua: true },
                orderBy: { nama: 'asc' }
            });

            // Get existing attendance for the date
            const existingAttendance = await Absensi.findAll({
                where: { tanggal: selectedDate },
                include: { anak: true },
                orderBy: [
                    { anak: { nama: 'asc' } }
                ]
            });

            // Create a map of existing attendance
            const attendanceMap = {};
            existingAttendance.forEach(att => {
                attendanceMap[att.anakId] = att;
            });

            res.render('admin/absensi/edit', {
                title: 'Edit Absensi - Candice Kids',
                layout: 'layouts/admin',
                selectedDate,
                children,
                existingAttendance: attendanceMap
            });
        } catch (error) {
            console.error('Error loading edit absensi form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/absensi');
        }
    }

    // Process edit absensi
    static async editAbsensi(req, res) {
        try {
            const { tanggal, absensiData } = req.body;

            console.log('Edit - Raw request body:', req.body);
            console.log('Edit - Tanggal:', tanggal);
            console.log('Edit - AbsensiData:', absensiData);

            if (!tanggal || !absensiData) {
                req.flash('error_msg', 'Data absensi tidak lengkap');
                return res.redirect('/admin/absensi/edit');
            }

            const selectedDate = new Date(tanggal);
            const userId = req.session.user.id;

            // Handle both array and object formats
            let attendanceEntries;
            if (Array.isArray(absensiData)) {
                // Convert array to object format
                attendanceEntries = absensiData.map((item, index) => [index.toString(), item]);
            } else {
                // Use object entries directly
                attendanceEntries = Object.entries(absensiData);
            }

            // Process each child's attendance
            for (const [anakId, data] of attendanceEntries) {
                const { status, anakId: explicitAnakId } = data;
                const finalAnakId = explicitAnakId || anakId;

                console.log('Edit - Processing attendance for anakId:', finalAnakId, 'status:', status);

                if (!finalAnakId || finalAnakId === '0') {
                    console.log('Edit - Skipping invalid anakId:', finalAnakId);
                    continue;
                }

                // Check if attendance already exists for this child and date
                const existingAttendance = await Absensi.findByAnakAndDate(finalAnakId, selectedDate);

                if (existingAttendance) {
                    // Update existing attendance
                    await existingAttendance.update({
                        status
                    });
                } else {
                    // Create new attendance
                    await Absensi.create({
                        anakId: parseInt(finalAnakId),
                        tanggal: selectedDate,
                        status,
                        createdBy: userId
                    });
                }
            }

            req.flash('success_msg', 'Data absensi berhasil diperbarui');
            res.redirect('/admin/absensi');
        } catch (error) {
            console.error('Error updating absensi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui data absensi');
            res.redirect('/admin/absensi/edit');
        }
    }

    // Delete absensi for a specific date
    static async deleteAbsensi(req, res) {
        try {
            const { date } = req.params;
            const selectedDate = new Date(date);

            // Get all attendance records for the date
            const attendanceRecords = await Absensi.findAll({
                where: { tanggal: selectedDate }
            });

            // Delete all attendance records for the date
            for (const record of attendanceRecords) {
                await record.delete();
            }

            req.flash('success_msg', 'Data absensi berhasil dihapus');
            res.redirect('/admin/absensi');
        } catch (error) {
            console.error('Error deleting absensi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus data absensi');
            res.redirect('/admin/absensi');
        }
    }

    // Display komunikasi management page
    static async showKomunikasi(req, res) {
        try {
            // Get all orang tua users
            const orangTuaList = await User.findByRole('orang_tua');

            // Get recent komunikasi for admin
            const recentKomunikasi = await Komunikasi.findByUser(req.session.user.id, {
                take: 10
            });

            res.render('admin/komunikasi', {
                title: 'Komunikasi - Candice Kids',
                layout: 'layouts/admin',
                orangTuaList,
                recentKomunikasi,
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading komunikasi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data komunikasi');
            res.redirect('/admin/dashboard');
        }
    }

    // Get chat messages between admin and specific user
    static async getChatMessages(req, res) {
        try {
            const { userId } = req.params;

            // Verify user exists and is orang tua
            const user = await User.findById(userId);
            if (!user || !user.isOrangTua()) {
                return res.status(404).json({ error: 'User tidak ditemukan' });
            }

            // Get chat messages between admin and user
            const messages = await Komunikasi.findByUsers(req.session.user.id, userId, {
                orderBy: { createdAt: 'asc' }
            });

            res.json({ messages: messages.map(m => m.toJSON()) });
        } catch (error) {
            console.error('Error getting chat messages:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil pesan' });
        }
    }

    // Send message from admin to user
    static async sendMessage(req, res) {
        try {
            const { penerimaId, pesan } = req.body;

            if (!penerimaId || !pesan) {
                return res.status(400).json({ error: 'Penerima dan pesan harus diisi' });
            }

            // Verify user exists and is orang tua
            const user = await User.findById(penerimaId);
            if (!user || !user.isOrangTua()) {
                return res.status(404).json({ error: 'User tidak ditemukan' });
            }

            // Create message
            const messageData = {
                pengirimId: req.session.user.id,
                penerimaId: parseInt(penerimaId),
                pesan: pesan.trim()
            };

            const newMessage = await Komunikasi.create(messageData);

            res.json({
                success: true,
                message: newMessage.toJSON()
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengirim pesan' });
        }
    }

    // Display tagihan management page
    static async showTagihan(req, res) {
        try {
            // Get filters from query parameters
            const filters = {
                year: req.query.year || new Date().getFullYear().toString(),
                status: req.query.status || 'all'
            };

            // Get monthly billing overview with filters
            const monthlyOverview = await AdminController.getMonthlyBillingOverview(filters);
            
            res.render('admin/tagihan', {
                title: 'Tagihan & Pembayaran - Candice Kids',
                layout: 'layouts/admin',
                monthlyOverview: monthlyOverview,
                filters: filters
            });
        } catch (error) {
            console.error('Error loading tagihan page:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data tagihan');
            res.redirect('/admin/dashboard');
        }
    }

    // Get monthly billing overview for admin
    static async getMonthlyBillingOverview(filters = {}) {
        try {
            const selectedYear = filters.year ? parseInt(filters.year) : new Date().getFullYear();
            const statusFilter = filters.status || 'all';

            // Get the earliest registration date from all children
            const earliestChild = await prisma.anak.findFirst({
                orderBy: { tanggalMasuk: 'asc' },
                select: { tanggalMasuk: true }
            });

            if (!earliestChild) {
                return [];
            }

            const startDate = new Date(earliestChild.tanggalMasuk);
            const currentDate = new Date();
            
            // Generate months for the selected year only
            const months = [];
            const startMonth = selectedYear === startDate.getFullYear() ? startDate.getMonth() : 0;
            const endMonth = selectedYear === currentDate.getFullYear() ? currentDate.getMonth() : 11;
            
            // Only show months for the selected year
            for (let month = startMonth; month <= endMonth; month++) {
                const currentMonth = new Date(selectedYear, month, 1);
                const monthNumber = month + 1; // 1-based month
                const periode = `${selectedYear}-${monthNumber.toString().padStart(2, '0')}`;
                
                months.push({
                    periode: periode,
                    year: selectedYear,
                    month: monthNumber,
                    monthName: currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                });
            }

            // Get billing data for each month
            const monthlyData = [];
            
            for (const monthInfo of months) {
                // Count total children who should have billing for this month
                const childrenInMonth = await prisma.anak.count({
                    where: {
                        tanggalMasuk: {
                            lte: new Date(monthInfo.year, monthInfo.month - 1, 31) // Before end of month
                        }
                    }
                });

                // Get actual tagihan data for this month
                const tagihanData = await prisma.tagihan.findMany({
                    where: {
                        periodeBulan: monthInfo.periode
                    },
                    include: {
                        anak: true,
                        pembayaran: true
                    }
                });

                // Count payment statuses - group belum ada tagihan, belum bayar, and sebagian as "belum bayar"
                const totalTagihan = tagihanData.length;
                const lunas = tagihanData.filter(t => t.status === 'lunas').length;
                const belumBayarFromTagihan = tagihanData.filter(t => t.status === 'belum_bayar' || t.status === 'sebagian').length;
                const missingTagihan = childrenInMonth - totalTagihan; // Children without tagihan
                const totalBelumBayar = belumBayarFromTagihan + missingTagihan; // Combine all "belum bayar" categories
                
                // Calculate total amounts
                const totalAmount = tagihanData.reduce((sum, t) => sum + parseFloat(t.jumlah), 0);
                const paidAmount = tagihanData.reduce((sum, t) => {
                    if (t.status === 'lunas') return sum + parseFloat(t.jumlah);
                    // For partial payments, calculate actual paid amount
                    const paid = t.pembayaran?.filter(p => 
                        ['settlement', 'capture'].includes(p.transactionStatus)
                    ).reduce((pSum, p) => pSum + parseFloat(p.jumlahBayar), 0) || 0;
                    return sum + paid;
                }, 0);

                const monthData = {
                    ...monthInfo,
                    childrenCount: childrenInMonth,
                    totalTagihan: totalTagihan,
                    missingTagihan: missingTagihan,
                    lunas: lunas,
                    belumBayar: totalBelumBayar, // Combined count
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    unpaidAmount: totalAmount - paidAmount,
                    paymentPercentage: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0
                };

                // Apply status filter
                if (statusFilter === 'all') {
                    monthlyData.push(monthData);
                } else if (statusFilter === 'lunas' && lunas > 0) {
                    monthlyData.push(monthData);
                } else if (statusFilter === 'belum_bayar' && totalBelumBayar > 0) {
                    monthlyData.push(monthData);
                } else if (statusFilter === 'sebagian' && belumBayarFromTagihan > 0) {
                    // Keep "sebagian" filter for backwards compatibility, but it now shows combined "belum bayar"
                    monthlyData.push(monthData);
                }
            }

            // Sort by period descending (newest first)
            return monthlyData.sort((a, b) => b.periode.localeCompare(a.periode));
            
        } catch (error) {
            console.error('Error getting monthly billing overview:', error);
            throw error;
        }
    }

    // Show detailed billing for specific month
    static async showTagihanDetail(req, res) {
        try {
            const { periode } = req.params;
            
            if (!periode) {
                req.flash('error_msg', 'Periode tidak valid');
                return res.redirect('/admin/tagihan');
            }

            // Get children who should have billing for this period
            const [year, month] = periode.split('-').map(Number);
            const monthEndDate = new Date(year, month - 1, 31);
            
            // Get all children registered before or during this month
            const eligibleChildren = await prisma.anak.findMany({
                where: {
                    tanggalMasuk: {
                        lte: monthEndDate
                    }
                },
                include: {
                    orangTua: {
                        select: {
                            id: true,
                            nama: true,
                            email: true,
                            telepon: true
                        }
                    }
                },
                orderBy: { nama: 'asc' }
            });

            // Get existing tagihan for this period
            const existingTagihan = await prisma.tagihan.findMany({
                where: {
                    periodeBulan: periode
                },
                include: {
                    anak: true,
                    orangTua: {
                        select: {
                            id: true,
                            nama: true,
                            email: true,
                            telepon: true
                        }
                    },
                    pembayaran: {
                        where: {
                            transactionStatus: {
                                in: ['settlement', 'capture', 'pending']
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Create a map of existing tagihan by anakId
            const tagihanMap = new Map();
            existingTagihan.forEach(tagihan => {
                tagihanMap.set(tagihan.anakId, tagihan);
            });

            // Combine data: children with their tagihan status
            const detailData = eligibleChildren.map(child => {
                const tagihan = tagihanMap.get(child.id);
                const registrationMonth = `${child.tanggalMasuk.getFullYear()}-${(child.tanggalMasuk.getMonth() + 1).toString().padStart(2, '0')}`;
                
                // Group "belum ada tagihan" and "belum bayar" as the same status
                let status, statusDisplay;
                if (!tagihan) {
                    status = 'belum_bayar'; // Treat "belum ada tagihan" as "belum bayar"
                    statusDisplay = 'Belum Bayar';
                } else if (tagihan.status === 'lunas') {
                    status = 'lunas';
                    statusDisplay = 'Lunas';
                } else {
                    // Both "belum_bayar" and "sebagian" are treated as "belum bayar"
                    status = 'belum_bayar';
                    statusDisplay = 'Belum Bayar';
                }
                
                return {
                    child: child,
                    tagihan: tagihan || null,
                    hasTagihan: !!tagihan,
                    status: status,
                    statusDisplay: statusDisplay,
                    amount: tagihan ? parseFloat(tagihan.jumlah) : 1000000, // Default amount
                    isNewStudent: registrationMonth === periode,
                    registrationDate: child.tanggalMasuk
                };
            });

            // Group by status for easy display
            const grouped = {
                belumBayar: detailData.filter(d => d.status === 'belum_bayar'),
                lunas: detailData.filter(d => d.status === 'lunas')
            };

            const periodeName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { 
                month: 'long', 
                year: 'numeric' 
            });

            res.render('admin/tagihan-detail', {
                title: `Detail Tagihan ${periodeName} - Candice Kids`,
                layout: 'layouts/admin',
                periode: periode,
                periodeName: periodeName,
                detailData: detailData,
                grouped: grouped,
                summary: {
                    total: detailData.length,
                    belumBayar: grouped.belumBayar.length,
                    lunas: grouped.lunas.length
                }
            });

        } catch (error) {
            console.error('Error loading tagihan detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail tagihan');
            res.redirect('/admin/tagihan');
        }
    }

    // Display notifikasi darurat management page
    static async showNotifikasiDarurat(req, res) {
        try {
            const { search, page = 1, limit = 10 } = req.query;

            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { deskripsi: { contains: search, mode: 'insensitive' } },
                    { anak: { nama: { contains: search, mode: 'insensitive' } } }
                ];
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get notifikasi darurat data with pagination
            const notifikasiList = await NotifikasiDarurat.findAll({
                where,
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                skip,
                take: parseInt(limit)
            });

            // Get total count for pagination
            const totalNotifikasi = await NotifikasiDarurat.findAll({ 
                where,
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                }
            });
            const totalPages = Math.ceil(totalNotifikasi.length / parseInt(limit));

            // Get statistics
            const stats = await NotifikasiDarurat.getStats();

            res.render('admin/notifikasi-darurat', {
                title: 'Notifikasi Darurat - Candice Kids',
                layout: 'layouts/admin',
                notifikasiList,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search }
            });
        } catch (error) {
            console.error('Error loading notifikasi darurat data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data notifikasi darurat');
            res.redirect('/admin/dashboard');
        }
    }

    // Show add notifikasi darurat form
    static async showAddNotifikasiDarurat(req, res) {
        try {
            const anakList = await Anak.findAll({
                where: { status: 'aktif' },
                include: { orangTua: true },
                orderBy: { nama: 'asc' }
            });

            res.render('admin/notifikasi-darurat/add', {
                title: 'Tambah Notifikasi Darurat - Candice Kids',
                layout: 'layouts/admin',
                anakList
            });
        } catch (error) {
            console.error('Error loading add notifikasi darurat form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/notifikasi-darurat');
        }
    }

    // Process add notifikasi darurat
    static async addNotifikasiDarurat(req, res) {
        try {
            const { anakId, deskripsi } = req.body;

            // Validate required fields
            if (!anakId || !deskripsi) {
                req.flash('error_msg', 'Semua field harus diisi');
                return res.redirect('/admin/notifikasi-darurat/add');
            }

            // Create notifikasi darurat data
            const notifikasiData = {
                anakId: parseInt(anakId),
                deskripsi: deskripsi.trim(),
                createdBy: req.session.user.id
            };

            // Create notifikasi darurat with full relations
            const notifikasi = await NotifikasiDarurat.create(notifikasiData);
            
            // Send email notification to parent
            try {
                if (notifikasi.anak && notifikasi.anak.orangTua && notifikasi.anak.orangTua.email) {
                    await emailService.sendEmergencyNotification(
                        notifikasi, 
                        notifikasi.anak, 
                        notifikasi.anak.orangTua
                    );
                    console.log('Emergency email sent successfully to:', notifikasi.anak.orangTua.email);
                    req.flash('success_msg', 'Notifikasi darurat berhasil ditambahkan dan email telah dikirim ke orang tua');
                } else {
                    console.log('No email found for parent, notification created without email');
                    req.flash('success_msg', 'Notifikasi darurat berhasil ditambahkan (email orang tua tidak ditemukan)');
                }
            } catch (emailError) {
                console.error('Error sending emergency email:', emailError);
                req.flash('success_msg', 'Notifikasi darurat berhasil ditambahkan (gagal mengirim email ke orang tua)');
            }
            
            res.redirect('/admin/notifikasi-darurat');
        } catch (error) {
            console.error('Error adding notifikasi darurat:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menambah notifikasi darurat');
            res.redirect('/admin/notifikasi-darurat/add');
        }
    }

    // Show edit notifikasi darurat form
    static async showEditNotifikasiDarurat(req, res) {
        try {
            const { id } = req.params;
            const notifikasi = await NotifikasiDarurat.findById(id);

            if (!notifikasi) {
                req.flash('error_msg', 'Notifikasi darurat tidak ditemukan');
                return res.redirect('/admin/notifikasi-darurat');
            }

            const anakList = await Anak.findAll({
                where: { status: 'aktif' },
                include: { orangTua: true },
                orderBy: { nama: 'asc' }
            });

            res.render('admin/notifikasi-darurat/edit', {
                title: 'Edit Notifikasi Darurat - Candice Kids',
                layout: 'layouts/admin',
                notifikasi,
                anakList
            });
        } catch (error) {
            console.error('Error loading edit notifikasi darurat form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/admin/notifikasi-darurat');
        }
    }

    // Process edit notifikasi darurat
    static async editNotifikasiDarurat(req, res) {
        try {
            const { id } = req.params;
            const { anakId, deskripsi } = req.body;

            // Validate required fields
            if (!anakId || !deskripsi) {
                req.flash('error_msg', 'Semua field harus diisi');
                return res.redirect(`/admin/notifikasi-darurat/edit/${id}`);
            }

            const notifikasi = await NotifikasiDarurat.findById(id);
            if (!notifikasi) {
                req.flash('error_msg', 'Notifikasi darurat tidak ditemukan');
                return res.redirect('/admin/notifikasi-darurat');
            }

            // Update notifikasi darurat data
            const updateData = {
                anakId: parseInt(anakId),
                deskripsi: deskripsi.trim()
            };

            await notifikasi.update(updateData);
            req.flash('success_msg', 'Notifikasi darurat berhasil diperbarui');
            res.redirect('/admin/notifikasi-darurat');
        } catch (error) {
            console.error('Error updating notifikasi darurat:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui notifikasi darurat');
            res.redirect(`/admin/notifikasi-darurat/edit/${req.params.id}`);
        }
    }

    // Delete notifikasi darurat
    static async deleteNotifikasiDarurat(req, res) {
        try {
            const { id } = req.params;
            const notifikasi = await NotifikasiDarurat.findById(id);

            if (!notifikasi) {
                req.flash('error_msg', 'Notifikasi darurat tidak ditemukan');
                return res.redirect('/admin/notifikasi-darurat');
            }

            await notifikasi.delete();
            req.flash('success_msg', 'Notifikasi darurat berhasil dihapus');
            res.redirect('/admin/notifikasi-darurat');
        } catch (error) {
            console.error('Error deleting notifikasi darurat:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus notifikasi darurat');
            res.redirect('/admin/notifikasi-darurat');
        }
    }

    // Show notifikasi darurat detail
    static async showNotifikasiDaruratDetail(req, res) {
        try {
            const { id } = req.params;
            const notifikasi = await NotifikasiDarurat.findById(id);

            if (!notifikasi) {
                req.flash('error_msg', 'Notifikasi darurat tidak ditemukan');
                return res.redirect('/admin/notifikasi-darurat');
            }

            res.render('admin/notifikasi-darurat/detail', {
                title: `Detail Notifikasi Darurat - Candice Kids`,
                layout: 'layouts/admin',
                notifikasi
            });
        } catch (error) {
            console.error('Error loading notifikasi darurat detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail notifikasi darurat');
            res.redirect('/admin/notifikasi-darurat');
        }
    }

    // Admin logout
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            // Redirect with query parameter for success message
            res.redirect('/admin/login?logout=success');
        });
    }
}

module.exports = AdminController;