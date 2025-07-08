const prisma = require('../lib/prisma');

class Anak {
    constructor(data) {
        this.id = data.id;
        this.nama = data.nama;
        this.tanggalLahir = data.tanggalLahir;
        this.jenisKelamin = data.jenisKelamin;
        this.alamat = data.alamat;
        this.teleponDarurat = data.teleponDarurat;
        this.kondisiKesehatan = data.kondisiKesehatan;
        this.alergi = data.alergi;
        this.foto = data.foto;
        this.dokumenAnak = data.dokumenAnak;
        this.orangTuaId = data.orangTuaId;
        this.tanggalMasuk = data.tanggalMasuk;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;

        // Handle included relationships
        if (data.orangTua) {
            this.orangTua = data.orangTua;
        }
        if (data.absensi) {
            this.absensi = data.absensi;
        }
        if (data.tagihan) {
            this.tagihan = data.tagihan;
        }
        if (data.notifikasiDarurat) {
            this.notifikasiDarurat = data.notifikasiDarurat;
        }
    }

    // Create new anak
    static async create(anakData) {
        try {
            const anak = await prisma.anak.create({
                data: anakData,
                include: {
                    orangTua: true
                }
            });
            return new Anak(anak);
        } catch (error) {
            throw new Error(`Error creating anak: ${error.message}`);
        }
    }

    // Find anak by ID
    static async findById(id) {
        try {
            const anak = await prisma.anak.findUnique({
                where: { id: parseInt(id) },
                include: {
                    orangTua: true,
                    absensi: true,
                    tagihan: true,
                    notifikasiDarurat: true
                }
            });
            return anak ? new Anak(anak) : null;
        } catch (error) {
            throw new Error(`Error finding anak: ${error.message}`);
        }
    }

    // Get all anak
    static async findAll(options = {}) {
        try {
            const anak = await prisma.anak.findMany({
                where: options.where,
                include: options.include || {
                    orangTua: true
                },
                orderBy: options.orderBy || [{ nama: 'asc' }],
                skip: options.skip,
                take: options.take
            });
            return anak.map(a => new Anak(a));
        } catch (error) {
            throw new Error(`Error finding anak: ${error.message}`);
        }
    }

    // Get active anak
    static async findActive() {
        try {
            const anak = await prisma.anak.findMany({
                where: { status: 'aktif' },
                include: {
                    orangTua: true
                },
                orderBy: { nama: 'asc' }
            });
            return anak.map(a => new Anak(a));
        } catch (error) {
            throw new Error(`Error finding active anak: ${error.message}`);
        }
    }

    // Get anak by orang tua
    static async findByOrangTua(orangTuaId) {
        try {
            const anak = await prisma.anak.findMany({
                where: {
                    orangTuaId: parseInt(orangTuaId),
                    status: 'aktif'
                },
                include: {
                    orangTua: true,
                    absensi: {
                        orderBy: { tanggal: 'desc' },
                        take: 10
                    },
                }
            });
            return anak.map(a => new Anak(a));
        } catch (error) {
            throw new Error(`Error finding anak by orang tua: ${error.message}`);
        }
    }

    // Update anak
    async update(updateData) {
        try {
            const updatedAnak = await prisma.anak.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    orangTua: true
                }
            });
            Object.assign(this, updatedAnak);
            return this;
        } catch (error) {
            throw new Error(`Error updating anak: ${error.message}`);
        }
    }

    // Delete anak
    async delete() {
        try {
            await prisma.anak.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting anak: ${error.message}`);
        }
    }

    // Get anak's attendance records
    async getAttendanceRecords(options = {}) {
        try {
            const attendance = await prisma.absensi.findMany({
                where: {
                    anakId: this.id,
                    ...options.where
                },
                orderBy: {
                    tanggal: 'desc'
                },
                include: {
                    createdByUser: true
                }
            });
            return attendance;
        } catch (error) {
            throw new Error(`Error getting attendance records: ${error.message}`);
        }
    }

    // Get anak's daily attendance
    async getDailyAttendance(date = new Date()) {
        try {
            const attendance = await prisma.absensi.findFirst({
                where: {
                    anakId: this.id,
                    tanggal: date
                },
                include: {
                    createdByUser: true
                }
            });
            return attendance;
        } catch (error) {
            throw new Error(`Error getting daily attendance: ${error.message}`);
        }
    }

    // Get anak's bills
    async getBills() {
        try {
            const bills = await prisma.tagihan.findMany({
                where: {
                    anakId: this.id
                },
                include: {
                    orangTua: true,
                    pembayaran: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return bills;
        } catch (error) {
            throw new Error(`Error getting bills: ${error.message}`);
        }
    }

    // Get anak's emergency notifications
    async getEmergencyNotifications() {
        try {
            const notifications = await prisma.notifikasiDarurat.findMany({
                where: {
                    anakId: this.id
                },
                include: {
                    createdByUser: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return notifications;
        } catch (error) {
            throw new Error(`Error getting emergency notifications: ${error.message}`);
        }
    }

    // Check if anak is active
    isActive() {
        return this.status === 'aktif';
    }

    // Get anak's age
    getAge() {
        const today = new Date();
        const birthDate = new Date(this.tanggalLahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Get anak's age in months
    getAgeInMonths() {
        const today = new Date();
        const birthDate = new Date(this.tanggalLahir);
        const yearDiff = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        return yearDiff * 12 + monthDiff;
    }

    // Get anak's enrollment duration in days
    getEnrollmentDuration() {
        if (!this.tanggalMasuk) return 0;
        const today = new Date();
        const enrollmentDate = new Date(this.tanggalMasuk);
        const diffTime = Math.abs(today - enrollmentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Check if anak has attendance today
    async hasAttendanceToday() {
        try {
            const attendance = await this.getDailyAttendance();
            return !!attendance;
        } catch (error) {
            return false;
        }
    }

    // Get anak's attendance statistics
    async getAttendanceStats(month = new Date()) {
        try {
            const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
            const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

            const attendance = await prisma.absensi.findMany({
                where: {
                    anakId: this.id,
                    tanggal: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            const stats = {
                total: attendance.length,
                hadir: attendance.filter(a => a.status === 'hadir').length,
                alpha: attendance.filter(a => a.status === 'alpha').length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting attendance stats: ${error.message}`);
        }
    }

    // Get anak info for display
    toJSON() {
        const json = {
            id: this.id,
            nama: this.nama,
            tanggalLahir: this.tanggalLahir,
            jenisKelamin: this.jenisKelamin,
            alamat: this.alamat,
            teleponDarurat: this.teleponDarurat,
            kondisiKesehatan: this.kondisiKesehatan,
            alergi: this.alergi,
            foto: this.foto,
            dokumenAnak: this.dokumenAnak,
            orangTuaId: this.orangTuaId,
            tanggalMasuk: this.tanggalMasuk,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            age: this.getAge(),
            ageInMonths: this.getAgeInMonths(),
            enrollmentDuration: this.getEnrollmentDuration()
        };

        // Include relationships if they exist
        if (this.orangTua) {
            json.orangTua = this.orangTua;
        }
        if (this.absensi) {
            json.absensi = this.absensi;
        }
        if (this.tagihan) {
            json.tagihan = this.tagihan;
        }
        if (this.notifikasiDarurat) {
            json.notifikasiDarurat = this.notifikasiDarurat;
        }

        return json;
    }
}

module.exports = Anak;