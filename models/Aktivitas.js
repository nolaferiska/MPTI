const prisma = require('../lib/prisma');

class Aktivitas {
    constructor(data) {
        this.id = data.id;
        this.tanggal = data.tanggal;
        this.namaAktivitas = data.namaAktivitas;
        this.deskripsi = data.deskripsi;
        this.waktuMulai = data.waktuMulai;
        this.waktuSelesai = data.waktuSelesai;
        this.foto = data.foto;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Create new aktivitas
    static async create(aktivitasData) {
        try {
            const aktivitas = await prisma.aktivitas.create({
                data: aktivitasData
            });
            return new Aktivitas(aktivitas);
        } catch (error) {
            throw new Error(`Error creating aktivitas: ${error.message}`);
        }
    }

    // Find aktivitas by ID
    static async findById(id) {
        try {
            const aktivitas = await prisma.aktivitas.findUnique({
                where: { id: parseInt(id) }
            });
            return aktivitas ? new Aktivitas(aktivitas) : null;
        } catch (error) {
            throw new Error(`Error finding aktivitas: ${error.message}`);
        }
    }

    // Get all aktivitas
    static async findAll(options = {}) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: options.where,
                orderBy: options.orderBy || [
                    { tanggal: 'desc' },
                    { waktuMulai: 'asc' }
                ],
                skip: options.skip,
                take: options.take
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding aktivitas: ${error.message}`);
        }
    }

    // Get aktivitas by date
    static async findByDate(date, options = {}) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    tanggal: date,
                    ...options.where
                },
                orderBy: [
                    { waktuMulai: 'asc' }
                ]
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding aktivitas by date: ${error.message}`);
        }
    }

    // Get aktivitas by nama aktivitas
    static async findByNama(namaAktivitas, options = {}) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    namaAktivitas: {
                        contains: namaAktivitas,
                        mode: 'insensitive'
                    },
                    ...options.where
                },
                orderBy: [
                    { tanggal: 'desc' },
                    { waktuMulai: 'asc' }
                ]
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding aktivitas by nama: ${error.message}`);
        }
    }

    // Get today's aktivitas
    static async findToday() {
        try {
            const today = new Date();
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    tanggal: today
                },
                orderBy: [
                    { waktuMulai: 'asc' }
                ]
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding today's aktivitas: ${error.message}`);
        }
    }

    // Get aktivitas by date range
    static async findByDateRange(startDate, endDate, options = {}) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    tanggal: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...options.where
                },
                orderBy: [
                    { tanggal: 'desc' },
                    { waktuMulai: 'asc' }
                ]
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding aktivitas by date range: ${error.message}`);
        }
    }

    // Update aktivitas
    async update(updateData) {
        try {
            const updatedAktivitas = await prisma.aktivitas.update({
                where: { id: this.id },
                data: updateData
            });
            Object.assign(this, updatedAktivitas);
            return this;
        } catch (error) {
            throw new Error(`Error updating aktivitas: ${error.message}`);
        }
    }

    // Delete aktivitas
    async delete() {
        try {
            await prisma.aktivitas.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting aktivitas: ${error.message}`);
        }
    }

    // Get aktivitas duration in minutes
    getDuration() {
        if (!this.waktuMulai || !this.waktuSelesai) return null;

        const mulai = new Date(this.waktuMulai);
        const selesai = new Date(this.waktuSelesai);
        const diffMs = selesai - mulai;
        const diffMinutes = diffMs / (1000 * 60);

        return Math.round(diffMinutes);
    }

    // Check if aktivitas is complete (has both start and end time)
    isComplete() {
        return !!(this.waktuMulai && this.waktuSelesai);
    }

    // Check if aktivitas is today
    isToday() {
        const today = new Date();
        const aktivitasDate = new Date(this.tanggal);
        return today.toDateString() === aktivitasDate.toDateString();
    }

    // Get aktivitas statistics for a date range
    static async getStats(startDate, endDate) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    tanggal: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            const stats = {
                total: aktivitas.length,
                withPhotos: aktivitas.filter(a => a.foto).length,
                complete: aktivitas.filter(a => a.waktuMulai && a.waktuSelesai).length,
                incomplete: aktivitas.filter(a => !a.waktuMulai || !a.waktuSelesai).length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting aktivitas stats: ${error.message}`);
        }
    }

    // Get daily aktivitas summary
    static async getDailySummary(date = new Date()) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    tanggal: date
                }
            });

            const summary = {
                date: date,
                total: aktivitas.length,
                withPhotos: aktivitas.filter(a => a.foto).length,
                complete: aktivitas.filter(a => a.waktuMulai && a.waktuSelesai).length,
                incomplete: aktivitas.filter(a => !a.waktuMulai || !a.waktuSelesai).length
            };

            return summary;
        } catch (error) {
            throw new Error(`Error getting daily summary: ${error.message}`);
        }
    }

    // Get aktivitas with photos
    static async findWithPhotos(options = {}) {
        try {
            const aktivitas = await prisma.aktivitas.findMany({
                where: {
                    foto: { not: null },
                    ...options.where
                },
                orderBy: [
                    { tanggal: 'desc' }
                ]
            });
            return aktivitas.map(a => new Aktivitas(a));
        } catch (error) {
            throw new Error(`Error finding aktivitas with photos: ${error.message}`);
        }
    }

    // Get aktivitas info for display
    toJSON() {
        return {
            id: this.id,
            tanggal: this.tanggal,
            namaAktivitas: this.namaAktivitas,
            deskripsi: this.deskripsi,
            waktuMulai: this.waktuMulai,
            waktuSelesai: this.waktuSelesai,
            foto: this.foto,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            duration: this.getDuration(),
            isComplete: this.isComplete(),
            isToday: this.isToday()
        };
    }
}

module.exports = Aktivitas;