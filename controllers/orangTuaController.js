const { Anak, User, Absensi, Aktivitas, Komunikasi, NotifikasiDarurat } = require('../models');

class OrangTuaController {
    // Display orang tua dashboard
    static async showDashboard(req, res) {
        try {
            const orangTuaId = req.session.user.id;
            // 1. Anak terdaftar
            const anakList = await Anak.findAll({ where: { orangTuaId } });
            // 2. Kehadiran hari ini
            const today = new Date();
            today.setHours(0,0,0,0);
            const absensiHariIni = await Absensi.findAll({
                where: {
                    anakId: { in: anakList.map(a => a.id) },
                    tanggal: today
                }
            });
            // 3. Tagihan pending
            const tagihanPending = await require('../models/Tagihan').findAll({
                where: {
                    anakId: { in: anakList.map(a => a.id) },
                    status: 'belum_bayar'
                }
            });

            // 5. Aktivitas terbaru (ambil 3 terakhir)
            let aktivitasTerbaru = [];
            try {
                aktivitasTerbaru = await Aktivitas.findAll({
                    where: anakList.length > 0 ? {
                        anakId: { in: anakList.map(a => a.id) }
                    } : {},
                    orderBy: { createdAt: 'desc' },
                    take: 3
                });
            } catch (err) {
                aktivitasTerbaru = [];
            }
            // Kirim ke view
            res.render('orangTua/dashboard', {
                title: 'Dashboard - Candice Kids',
                layout: 'layouts/orangTua',
                user: req.session.user || {},
                anakList: Array.isArray(anakList) ? anakList : [],
                absensiHariIni: Array.isArray(absensiHariIni) ? absensiHariIni : [],
                tagihanPending: Array.isArray(tagihanPending) ? tagihanPending : [],
                aktivitasTerbaru: Array.isArray(aktivitasTerbaru) ? aktivitasTerbaru : [],
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            req.flash('error_msg', 'Gagal memuat dashboard');
            res.redirect('/');
        }
    }

    // Display kelola anak page (list anak)
    static async showKelolaAnak(req, res) {
        try {
            const { search, status, page = 1, limit = 10 } = req.query;
            const orangTuaId = req.session.user.id;

            // Build where clause for parent's children only
            const where = {
                orangTuaId: orangTuaId
            };

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

            res.render('orangTua/kelola-anak', {
                title: 'Kelola Data Anak - Candice Kids',
                layout: 'layouts/orangTua',
                anakList,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search, status },
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading kelola anak data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data anak');
            res.redirect('/dashboard');
        }
    }

    // Show add anak form for parent
    static async showAddAnak(req, res) {
        try {
            res.render('orangTua/anak/add', {
                title: 'Tambah Data Anak - Candice Kids',
                layout: 'layouts/orangTua',
                currentUserId: req.session.user.id,
            });
        } catch (error) {
            console.error('Error loading add anak form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/kelola-anak');
        }
    }

    // Process add anak for parent
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
                tanggalMasuk
            } = req.body;
            const dokumenAnak = req.file ? `/uploads/dokumen-anak/${req.file.filename}` : null;

            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect('/kelola-anak/add');
            }

            // Validate file upload
            if (!req.file) {
                req.flash('error_msg', 'Dokumen form anak wajib diupload');
                return res.redirect('/kelola-anak/add');
            }

            // Create anak data with current parent's ID
            const anakData = {
                nama,
                tanggalLahir: new Date(tanggalLahir),
                jenisKelamin,
                alamat,
                teleponDarurat: teleponDarurat || null,
                kondisiKesehatan: kondisiKesehatan || null,
                alergi: alergi || null,
                dokumenAnak,
                orangTuaId: req.session.user.id, // Use current parent's ID
                tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : new Date(),
                status: 'aktif'
            };

            await Anak.create(anakData);
            req.flash('success_msg', 'Data anak berhasil ditambahkan');
            res.redirect('/kelola-anak');
        } catch (error) {
            console.error('Error adding anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menambah data anak');
            res.redirect('/kelola-anak/add');
        }
    }

    // Show anak detail for parent
    static async showAnakDetail(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;

            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/kelola-anak');
            }

            // Check if this child belongs to current parent
            if (anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses untuk melihat data anak ini');
                return res.redirect('/kelola-anak');
            }

            // Get related data
            const attendanceStats = await anak.getAttendanceStats();
            const recentAttendance = await anak.getAttendanceRecords({ take: 5 });

            res.render('orangTua/anak/detail', {
                title: `Detail ${anak.nama} - Candice Kids`,
                layout: 'layouts/orangTua',
                anak,
                attendanceStats,
                recentAttendance,
                currentUserId: req.session.user.id,
            });
        } catch (error) {
            console.error('Error loading anak detail:', error);
            req.flash('error_msg', error.message);
            res.redirect('/kelola-anak');
        }
    }

    // Show edit anak form for parent
    static async showEditAnak(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;

            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/kelola-anak');
            }

            // Check if this child belongs to current parent
            if (anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses untuk mengedit data anak ini');
                return res.redirect('/kelola-anak');
            }

            res.render('orangTua/anak/edit', {
                title: 'Edit Data Anak - Candice Kids',
                layout: 'layouts/orangTua',
                currentUserId: req.session.user.id,
                anak
            });
        } catch (error) {
            console.error('Error loading edit anak form:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat form');
            res.redirect('/kelola-anak');
        }
    }

    // Process edit anak for parent
    static async editAnak(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;
            const {
                nama,
                tanggalLahir,
                jenisKelamin,
                alamat,
                teleponDarurat,
                kondisiKesehatan,
                alergi,
                tanggalMasuk
            } = req.body;

            const dokumenAnak = req.file ? `/uploads/dokumen-anak/${req.file.filename}` : null;


            // Validate required fields
            if (!nama || !tanggalLahir || !jenisKelamin || !alamat) {
                req.flash('error_msg', 'Semua field wajib diisi');
                return res.redirect(`/kelola-anak/edit/${id}`);
            }

            const anak = await Anak.findById(id);
            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/kelola-anak');
            }

            // Check if this child belongs to current parent
            if (anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses untuk mengedit data anak ini');
                return res.redirect('/kelola-anak');
            }

            // Update anak data (parent cannot change orangTuaId)
            const updateData = {
                nama,
                tanggalLahir: new Date(tanggalLahir),
                jenisKelamin,
                alamat,
                teleponDarurat: teleponDarurat || null,
                kondisiKesehatan: kondisiKesehatan || null,
                alergi: alergi || null,
                tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : anak.tanggalMasuk
            };

            // Update dokumenAnak if new file is uploaded
            if (req.file) {
                updateData.dokumenAnak = dokumenAnak;
            }

            await anak.update(updateData);
            req.flash('success_msg', 'Data anak berhasil diperbarui');
            res.redirect('/kelola-anak');
        } catch (error) {
            console.error('Error updating anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memperbarui data anak');
            res.redirect(`/kelola-anak/edit/${req.params.id}`);
        }
    }

    // Delete anak for parent
    static async deleteAnak(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;

            const anak = await Anak.findById(id);

            if (!anak) {
                req.flash('error_msg', 'Data anak tidak ditemukan');
                return res.redirect('/kelola-anak');
            }

            // Check if this child belongs to current parent
            if (anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses untuk menghapus data anak ini');
                return res.redirect('/kelola-anak');
            }

            await anak.delete();
            req.flash('success_msg', 'Data anak berhasil dihapus');
            res.redirect('/kelola-anak');
        } catch (error) {
            console.error('Error deleting anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat menghapus data anak');
            res.redirect('/kelola-anak');
        }
    }

    // Display absen anak page
    static async showAbsen(req, res) {
        try {
            const { anakId, status, tanggal, page = 1, limit = 10 } = req.query;
            const orangTuaId = req.session.user.id;

            // Get parent's children first
            const anakList = await Anak.findByOrangTua(orangTuaId);
            const anakIds = anakList.map(anak => anak.id);

            if (anakIds.length === 0) {
                return res.render('orangTua/absen', {
                    title: 'Absen Anak - Candice Kids',
                    layout: 'layouts/orangTua',
                    absensiList: [],
                    anakList: [],
                    monthlyStats: { total: 0, hadir: 0, alpha: 0 },
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    },
                    currentUserId: req.session.user.id,
                    filters: { anakId, status, tanggal }
                });
            }

            // Build where clause for attendance
            const where = {
                anakId: { in: anakIds }
            };

            // If specific child is selected, filter by that child
            if (anakId && anakId !== 'all') {
                const selectedAnakId = parseInt(anakId);
                // Verify the selected child belongs to this parent
                if (anakIds.includes(selectedAnakId)) {
                    where.anakId = selectedAnakId;
                }
            }

            if (status && status !== 'all') {
                where.status = status;
            }
            if (tanggal) {
                where.tanggal = new Date(tanggal);
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get attendance data with pagination
            const absensiList = await Absensi.findAll({
                where,
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                orderBy: [
                    { tanggal: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip,
                take: parseInt(limit)
            });

            // Get total count for pagination
            const totalAbsensi = await Absensi.findAll({ where });
            const totalPages = Math.ceil(totalAbsensi.length / parseInt(limit));

            // Get attendance statistics for current month
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            // Calculate stats for selected child or all children
            let statsAnakIds = anakIds;
            if (anakId && anakId !== 'all') {
                const selectedAnakId = parseInt(anakId);
                if (anakIds.includes(selectedAnakId)) {
                    statsAnakIds = [selectedAnakId];
                }
            }

            const monthlyStats = await Absensi.getStats(startOfMonth, endOfMonth, statsAnakIds);

            res.render('orangTua/absen', {
                title: 'Absen Anak - Candice Kids',
                layout: 'layouts/orangTua',
                absensiList,
                anakList,
                monthlyStats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                currentUserId: req.session.user.id,
                filters: { anakId, status, tanggal }
            });
        } catch (error) {
            console.error('Error loading absen data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data absensi');
            res.redirect('/dashboard');
        }
    }

    // Show absen detail for specific child and date
    static async showAbsenDetail(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;

            const absensi = await Absensi.findById(id);

            if (!absensi) {
                req.flash('error_msg', 'Data absensi tidak ditemukan');
                return res.redirect('/absen');
            }

            // Check if this attendance belongs to current parent's child
            const anak = await Anak.findById(absensi.anakId);
            if (!anak || anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses untuk melihat data absensi ini');
                return res.redirect('/absen');
            }

            res.render('orangTua/absen/detail', {
                title: `Detail Absensi ${anak.nama} - Candice Kids`,
                layout: 'layouts/orangTua',
                absensi,
                currentUserId: req.session.user.id,
                anak
            });
        } catch (error) {
            console.error('Error loading absen detail:', error);
            req.flash('error_msg', error.message);
            res.redirect('/absen');
        }
    }

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

            res.render('orangTua/aktivitas', {
                title: 'Aktivitas Harian - Candice Kids',
                layout: 'layouts/orangTua',
                aktivitasList,
                currentUserId: req.session.user.id,
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
            res.redirect('/dashboard');
        }
    }

    // Show aktivitas detail
    static async showAktivitasDetail(req, res) {
        try {
            const { id } = req.params;
            const aktivitas = await Aktivitas.findById(id);

            if (!aktivitas) {
                req.flash('error_msg', 'Data aktivitas tidak ditemukan');
                return res.redirect('/orangTua/aktivitas');
            }

            res.render('orangTua/aktivitas/detail', {
                title: `Detail Aktivitas - Candice Kids`,
                layout: 'layouts/orangTua',
                currentUserId: req.session.user.id,
                aktivitas
            });
        } catch (error) {
            console.error('Error loading aktivitas detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail aktivitas');
            res.redirect('/aktivitas');
        }
    }



    // Communication with admin
    static async showKomunikasi(req, res) {
        try {
            // Get admin users
            const adminList = await User.findByRole('admin');

            // Get recent komunikasi for this parent
            const recentKomunikasi = await Komunikasi.findByUser(req.session.user.id, {
                take: 10
            });

            res.render('orangTua/komunikasi', {
                title: 'Komunikasi dengan Admin - Candice Kids',
                layout: 'layouts/orangTua',
                adminList,
                recentKomunikasi,
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading komunikasi:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat komunikasi');
            res.redirect('/orangTua/dashboard');
        }
    }

    // Ambil pesan chat antara orang tua dan admin tertentu
    static async getChatMessages(req, res) {
        try {
            const orangTuaId = req.session.user.id;
            const adminId = parseInt(req.params.adminId);
            if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID tidak valid' });
            const messages = await Komunikasi.findByUsers(orangTuaId, adminId);
            res.json({ success: true, messages: messages.map(m => m.toJSON()) });
        } catch (error) {
            console.error('Error getChatMessages:', error);
            res.status(500).json({ success: false, error: 'Gagal mengambil pesan' });
        }
    }

    // Orang tua kirim pesan ke admin
    static async sendMessage(req, res) {
    try {
        const pengirimId = req.session.user.id;
        const { penerimaId, pesan } = req.body;
        
        console.log('ORANGTUA SEND MESSAGE:', { pengirimId, penerimaId, pesan });
        
        if (!penerimaId || !pesan) {
            return res.status(400).json({ success: false, error: 'Data tidak lengkap' });
        }
        
        const komunikasiData = {
            pengirimId: parseInt(pengirimId),
            penerimaId: parseInt(penerimaId),
            pesan: pesan.trim(),
        };
        
        const savedMessage = await Komunikasi.create(komunikasiData);
        
        // Get the saved message with relations
        const messageWithRelations = await Komunikasi.findById(savedMessage.id, {
            include: [
                {
                    model: User,
                    as: 'pengirim',
                    attributes: ['id', 'nama', 'role']
                },
                {
                    model: User,
                    as: 'penerima',
                    attributes: ['id', 'nama', 'role']
                }
            ]
        });
        console.log('SAVED MESSAGE:', messageWithRelations.toJSON());
        
        res.json({ success: true, message: messageWithRelations.toJSON() });
    } catch (error) {
        console.error('Error sendMessage (orang tua):', error);
        res.status(500).json({ success: false, error: 'Gagal mengirim pesan' });
    }
    }


    // Display tagihan & pembayaran page
    static async showTagihan(req, res) {
        res.render('orangTua/tagihan', {
            title: 'Tagihan & Pembayaran - Candice Kids',
            layout: 'layouts/orangTua',
            currentUserId: req.session.user.id
        });
    }

    // Display notifikasi darurat page
    static async showNotifikasi(req, res) {
        try {
            const { search, anak, status, page = 1, limit = 10 } = req.query;
            const orangTuaId = req.session.user.id;

            // Get parent's children first
            const anakList = await Anak.findAll({
                where: { orangTuaId: orangTuaId, status: 'aktif' },
                orderBy: { nama: 'asc' }
            });

            const anakIds = anakList.map(anak => anak.id);

            if (anakIds.length === 0) {
                return res.render('orangTua/notifikasi', {
                    title: 'Notifikasi Darurat - Candice Kids',
                    layout: 'layouts/orangTua',
                    currentUserId: req.session.user.id,
                    notifikasiList: [],
                    anakList: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    },
                    filters: { search, anak, status },
                    stats: { total: 0, urgent: 0 },
                    currentUserId: req.session.user.id
                });
            }

            // Build where clause for notifications related to parent's children
            const where = {
                anakId: { in: anakIds }
            };

            if (search) {
                where.OR = [
                    { deskripsi: { contains: search, mode: 'insensitive' } },
                    { anak: { nama: { contains: search, mode: 'insensitive' } } }
                ];
            }

            if (anak && anak !== 'all') {
                where.anakId = parseInt(anak);
            }

            // Filter by urgency status
            if (status === 'urgent') {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                where.createdAt = { gte: oneDayAgo };
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get notifikasi data with pagination
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
            const totalNotifikasi = await NotifikasiDarurat.findAll({ where });
            const totalPages = Math.ceil(totalNotifikasi.length / parseInt(limit));

            // Get statistics for parent's children only
            const stats = await NotifikasiDarurat.getStats();
            const parentStats = {
                total: totalNotifikasi.length,
                urgent: totalNotifikasi.filter(n => {
                    const now = new Date();
                    const created = new Date(n.createdAt);
                    const diffHours = (now - created) / (1000 * 60 * 60);
                    return diffHours <= 24;
                }).length
            };

            res.render('orangTua/notifikasi', {
                title: 'Notifikasi Darurat - Candice Kids',
                layout: 'layouts/orangTua',
                currentUserId: req.session.user.id,
                notifikasiList,
                anakList,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { search, anak, status },
                stats: parentStats,
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading notifikasi darurat data:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat data notifikasi darurat');
            res.redirect('/dashboard');
        }
    }

    // Show notifikasi darurat detail
    static async showNotifikasiDetail(req, res) {
        try {
            const { id } = req.params;
            const orangTuaId = req.session.user.id;

            const notifikasi = await NotifikasiDarurat.findById(id);

            if (!notifikasi) {
                req.flash('error_msg', 'Notifikasi darurat tidak ditemukan');
                return res.redirect('/notifikasi');
            }

            // Check if this notification belongs to parent's child
            const anak = await Anak.findById(notifikasi.anakId);
            if (!anak || anak.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Anda tidak memiliki akses ke notifikasi ini');
                return res.redirect('/notifikasi');
            }

            res.render('orangTua/notifikasi/detail', {
                title: `Detail Notifikasi Darurat - Candice Kids`,
                layout: 'layouts/orangTua',
                notifikasi,
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error loading notifikasi darurat detail:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat detail notifikasi darurat');
            res.redirect('/notifikasi');
        }
    }

    // Orang tua logout
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            req.flash('success_msg', 'Logout berhasil');
            res.redirect('/login');
        });
    }
}

module.exports = OrangTuaController;