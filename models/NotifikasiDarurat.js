const prisma = require('../lib/prisma');

class NotifikasiDarurat {
    constructor(data) {
        this.id = data.id;
        this.anakId = data.anakId;
        this.deskripsi = data.deskripsi;
        this.createdBy = data.createdBy;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        
        // Include relational data
        this.anak = data.anak;
        this.createdByUser = data.createdByUser;
    }

    // Create new notifikasi darurat
    static async create(notifikasiData) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.create({
                data: notifikasiData,
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                }
            });
            return new NotifikasiDarurat(notifikasi);
        } catch (error) {
            throw new Error(`Error creating notifikasi darurat: ${error.message}`);
        }
    }

    // Find notifikasi darurat by ID
    static async findById(id) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findUnique({
                where: { id: parseInt(id) },
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                }
            });
            return notifikasi ? new NotifikasiDarurat(notifikasi) : null;
        } catch (error) {
            throw new Error(`Error finding notifikasi darurat: ${error.message}`);
        }
    }

    // Get all notifikasi darurat
    static async findAll(options = {}) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findMany({
                where: options.where,
                include: options.include || {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                orderBy: options.orderBy || {
                    createdAt: 'desc'
                },
                skip: options.skip,
                take: options.take
            });
            return notifikasi.map(n => new NotifikasiDarurat(n));
        } catch (error) {
            throw new Error(`Error finding notifikasi darurat: ${error.message}`);
        }
    }

    // Get notifikasi darurat by anak
    static async findByAnak(anakId, options = {}) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findMany({
                where: {
                    anakId: parseInt(anakId),
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
                    createdAt: 'desc'
                }
            });
            return notifikasi.map(n => new NotifikasiDarurat(n));
        } catch (error) {
            throw new Error(`Error finding notifikasi darurat by anak: ${error.message}`);
        }
    }

    // Get recent notifikasi darurat
    static async findRecent(limit = 10) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findMany({
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
            return notifikasi.map(n => new NotifikasiDarurat(n));
        } catch (error) {
            throw new Error(`Error finding recent notifikasi darurat: ${error.message}`);
        }
    }

    // Get notifikasi darurat by date range
    static async findByDateRange(startDate, endDate, options = {}) {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findMany({
                where: {
                    createdAt: {
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
                    createdAt: 'desc'
                }
            });
            return notifikasi.map(n => new NotifikasiDarurat(n));
        } catch (error) {
            throw new Error(`Error finding notifikasi darurat by date range: ${error.message}`);
        }
    }

    // Update notifikasi darurat
    async update(updateData) {
        try {
            const updatedNotifikasi = await prisma.notifikasiDarurat.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                }
            });
            Object.assign(this, updatedNotifikasi);
            return this;
        } catch (error) {
            throw new Error(`Error updating notifikasi darurat: ${error.message}`);
        }
    }

    // Delete notifikasi darurat
    async delete() {
        try {
            await prisma.notifikasiDarurat.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting notifikasi darurat: ${error.message}`);
        }
    }

    // Check if notifikasi darurat is urgent (created within last 24 hours)
    isUrgent() {
        const now = new Date();
        const created = new Date(this.createdAt);
        const diffHours = (now - created) / (1000 * 60 * 60);
        return diffHours <= 24;
    }

    // Get notifikasi darurat statistics
    static async getStats() {
        try {
            const notifikasi = await prisma.notifikasiDarurat.findMany();

            const stats = {
                total: notifikasi.length,
                urgent: notifikasi.filter(n => {
                    const now = new Date();
                    const created = new Date(n.createdAt);
                    const diffHours = (now - created) / (1000 * 60 * 60);
                    return diffHours <= 24;
                }).length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting notifikasi darurat stats: ${error.message}`);
        }
    }

    // Get daily notifikasi darurat summary
    static async getDailySummary(date = new Date()) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const notifikasi = await prisma.notifikasiDarurat.findMany({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: {
                    anak: {
                        include: {
                            orangTua: true
                        }
                    },
                    createdByUser: true
                }
            });

            const summary = {
                date: date,
                total: notifikasi.length
            };

            return summary;
        } catch (error) {
            throw new Error(`Error getting daily summary: ${error.message}`);
        }
    }

    // Get notifikasi darurat info for display
    toJSON() {
        return {
            id: this.id,
            anakId: this.anakId,
            deskripsi: this.deskripsi,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            anak: this.anak,
            createdByUser: this.createdByUser,
            isUrgent: this.isUrgent()
        };
    }
}

module.exports = NotifikasiDarurat;