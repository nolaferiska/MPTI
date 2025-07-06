const prisma = require('../lib/prisma');

class Absensi {
    constructor(data) {
        this.id = data.id;
        this.anakId = data.anakId; // Use Prisma field name
        this.tanggal = data.tanggal;
        this.status = data.status;
        this.createdBy = data.createdBy; // Use Prisma field name
        this.createdAt = data.createdAt; // Use Prisma field name
        this.updatedAt = data.updatedAt; // Use Prisma field name
        this.anak = data.anak; // Include anak data if available
        this.createdByUser = data.createdByUser; // Include createdByUser data if available
    }

    // Create new absensi
    static async create(absensiData) {
        try {
            // Validate that anakId exists
            if (absensiData.anakId) {
                const anak = await prisma.anak.findUnique({
                    where: { id: parseInt(absensiData.anakId) }
                });

                if (!anak) {
                    throw new Error(`Anak with ID ${absensiData.anakId} not found`);
                }
            }

            const absensi = await prisma.absensi.create({
                data: absensiData,
                include: {
                    anak: true,
                    createdByUser: true
                }
            });
            return new Absensi(absensi);
        } catch (error) {
            throw new Error(`Error creating absensi: ${error.message}`);
        }
    }

    // Find absensi by ID
    static async findById(id) {
        try {
            const absensi = await prisma.absensi.findUnique({
                where: { id: parseInt(id) },
                include: {
                    anak: true,
                    createdByUser: true
                }
            });
            return absensi ? new Absensi(absensi) : null;
        } catch (error) {
            throw new Error(`Error finding absensi: ${error.message}`);
        }
    }

    // Find absensi by anak and date
    static async findByAnakAndDate(anakId, tanggal) {
        try {
            const absensi = await prisma.absensi.findFirst({
                where: {
                    anakId: parseInt(anakId),
                    tanggal: tanggal
                },
                include: {
                    anak: true,
                    createdByUser: true
                }
            });
            return absensi ? new Absensi(absensi) : null;
        } catch (error) {
            throw new Error(`Error finding absensi by anak and date: ${error.message}`);
        }
    }

    // Get all absensi
    static async findAll(options = {}) {
        try {
            const absensi = await prisma.absensi.findMany({
                where: options.where,
                include: options.include || {
                    anak: true,
                    createdByUser: true
                },
                orderBy: options.orderBy || [
                    { tanggal: 'desc' }
                ],
                skip: options.skip,
                take: options.take
            });
            return absensi.map(a => new Absensi(a));
        } catch (error) {
            throw new Error(`Error finding absensi: ${error.message}`);
        }
    }

    // Get today's absensi
    static async findToday() {
        try {
            const today = new Date();
            const absensi = await prisma.absensi.findMany({
                where: {
                    tanggal: today
                },
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            return absensi.map(a => new Absensi(a));
        } catch (error) {
            throw new Error(`Error finding today's absensi: ${error.message}`);
        }
    }

    // Get absensi by date range
    static async findByDateRange(startDate, endDate, options = {}) {
        try {
            const absensi = await prisma.absensi.findMany({
                where: {
                    tanggal: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...options.where
                },
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                orderBy: {
                    tanggal: 'desc'
                }
            });
            return absensi.map(a => new Absensi(a));
        } catch (error) {
            throw new Error(`Error finding absensi by date range: ${error.message}`);
        }
    }

    // Get absensi by anak
    static async findByAnak(anakId, options = {}) {
        try {
            const absensi = await prisma.absensi.findMany({
                where: {
                    anakId: parseInt(anakId),
                    ...options.where
                },
                include: {
                    anak: true,
                    createdByUser: true
                },
                orderBy: {
                    tanggal: 'desc'
                }
            });
            return absensi.map(a => new Absensi(a));
        } catch (error) {
            throw new Error(`Error finding absensi by anak: ${error.message}`);
        }
    }

    // Get absensi by status
    static async findByStatus(status, options = {}) {
        try {
            const absensi = await prisma.absensi.findMany({
                where: {
                    status,
                    ...options.where
                },
                include: {
                    anak: true,
                    createdByUser: true
                },
                orderBy: {
                    tanggal: 'desc'
                }
            });
            return absensi.map(a => new Absensi(a));
        } catch (error) {
            throw new Error(`Error finding absensi by status: ${error.message}`);
        }
    }

    // Update absensi
    async update(updateData) {
        try {
            const updatedAbsensi = await prisma.absensi.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    anak: true,
                    createdByUser: true
                }
            });
            Object.assign(this, updatedAbsensi);
            return this;
        } catch (error) {
            throw new Error(`Error updating absensi: ${error.message}`);
        }
    }

    // Delete absensi
    async delete() {
        try {
            await prisma.absensi.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting absensi: ${error.message}`);
        }
    }

    // Check if attendance is today
    isToday() {
        const today = new Date();
        const attendanceDate = new Date(this.tanggal);
        return today.toDateString() === attendanceDate.toDateString();
    }

    // Get attendance status display name
    getStatusDisplay() {
        const statusMap = {
            'hadir': 'Hadir',
            'alpha': 'Alpha'
        };
        return statusMap[this.status] || this.status;
    }

    // Get attendance statistics for a date range
    static async getStats(startDate, endDate, anakIds = null) {
        try {
            const whereClause = {
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            };

            // If anakIds is provided, filter by those specific children
            if (anakIds && anakIds.length > 0) {
                whereClause.anakId = { in: anakIds };
            }

            const absensi = await prisma.absensi.findMany({
                where: whereClause
            });

            const stats = {
                total: absensi.length,
                hadir: absensi.filter(a => a.status === 'hadir').length,
                alpha: absensi.filter(a => a.status === 'alpha').length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting attendance stats: ${error.message}`);
        }
    }

    // Get daily attendance summary
    static async getDailySummary(date = new Date()) {
        try {
            const absensi = await prisma.absensi.findMany({
                where: {
                    tanggal: date
                },
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    }
                }
            });

            const summary = {
                date: date,
                total: absensi.length,
                hadir: absensi.filter(a => a.status === 'hadir').length,
                alpha: absensi.filter(a => a.status === 'alpha').length
            };

            return summary;
        } catch (error) {
            throw new Error(`Error getting daily summary: ${error.message}`);
        }
    }

    // Get all dates with attendance data
    static async getAllAttendanceDates() {
        try {
            const dates = await prisma.absensi.findMany({
                select: {
                    tanggal: true
                },
                distinct: ['tanggal'],
                orderBy: {
                    tanggal: 'desc'
                }
            });
            return dates.map(d => d.tanggal);
        } catch (error) {
            throw new Error(`Error getting attendance dates: ${error.message}`);
        }
    }

    // Get absensi info for display
    toJSON() {
        return {
            id: this.id,
            anakId: this.anakId,
            tanggal: this.tanggal,
            status: this.status,
            statusDisplay: this.getStatusDisplay(),
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isToday: this.isToday(),
            anak: this.anak, // Include anak data if available
            createdByUser: this.createdByUser // Include createdByUser data if available
        };
    }
}

module.exports = Absensi;