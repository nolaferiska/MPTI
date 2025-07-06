const prisma = require('../lib/prisma');

class Tagihan {
    constructor(data) {
        this.id = data.id;
        this.orangTuaId = data.orangTuaId;
        this.anakId = data.anakId;
        this.periodeBulan = data.periodeBulan;
        this.jumlah = data.jumlah;
        this.tanggalJatuhTempo = data.tanggalJatuhTempo;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        
        // Include relations if they exist
        if (data.orangTua) this.orangTua = data.orangTua;
        if (data.anak) this.anak = data.anak;
        if (data.pembayaran) this.pembayaran = data.pembayaran;
    }

    // Create new tagihan
    static async create(tagihanData) {
        try {
            const tagihan = await prisma.tagihan.create({
                data: tagihanData,
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                }
            });
            return new Tagihan(tagihan);
        } catch (error) {
            throw new Error(`Error creating tagihan: ${error.message}`);
        }
    }

    // Find tagihan by ID
    static async findById(id) {
        try {
            const tagihan = await prisma.tagihan.findUnique({
                where: { id: parseInt(id) },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                }
            });
            return tagihan ? new Tagihan(tagihan) : null;
        } catch (error) {
            throw new Error(`Error finding tagihan: ${error.message}`);
        }
    }

    // Get all tagihan
    static async findAll(options = {}) {
        try {
            const tagihan = await prisma.tagihan.findMany({
                where: options.where,
                include: options.include || {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                },
                orderBy: options.orderBy || {
                    createdAt: 'desc'
                },
                skip: options.skip,
                take: options.take
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding tagihan: ${error.message}`);
        }
    }

    // Get tagihan by orang tua
    static async findByOrangTua(orangTuaId, options = {}) {
        try {
            const tagihan = await prisma.tagihan.findMany({
                where: {
                    orangTuaId: parseInt(orangTuaId),
                    ...options.where
                },
                include: {
                    anak: true,
                    pembayaran: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding tagihan by orang tua: ${error.message}`);
        }
    }

    // Get tagihan by anak
    static async findByAnak(anakId, options = {}) {
        try {
            const tagihan = await prisma.tagihan.findMany({
                where: {
                    anakId: parseInt(anakId),
                    ...options.where
                },
                include: {
                    orangTua: true,
                    pembayaran: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding tagihan by anak: ${error.message}`);
        }
    }

    // Get tagihan by status
    static async findByStatus(status, options = {}) {
        try {
            const tagihan = await prisma.tagihan.findMany({
                where: {
                    status,
                    ...options.where
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding tagihan by status: ${error.message}`);
        }
    }

    // Get tagihan by periode
    static async findByPeriode(periodeBulan, options = {}) {
        try {
            const tagihan = await prisma.tagihan.findMany({
                where: {
                    periodeBulan,
                    ...options.where
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding tagihan by periode: ${error.message}`);
        }
    }

    // Get overdue tagihan
    static async findOverdue() {
        try {
            const today = new Date();
            const tagihan = await prisma.tagihan.findMany({
                where: {
                    tanggalJatuhTempo: {
                        lt: today
                    },
                    status: { in: ['belum_bayar', 'sebagian']
                    }
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                },
                orderBy: {
                    tanggalJatuhTempo: 'asc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding overdue tagihan: ${error.message}`);
        }
    }

    // Get upcoming due tagihan
    static async findUpcomingDue(days = 7) {
        try {
            const today = new Date();
            const upcomingDate = new Date();
            upcomingDate.setDate(today.getDate() + days);

            const tagihan = await prisma.tagihan.findMany({
                where: {
                    tanggalJatuhTempo: {
                        gte: today,
                        lte: upcomingDate
                    },
                    status: { in: ['belum_bayar', 'sebagian']
                    }
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                },
                orderBy: {
                    tanggalJatuhTempo: 'asc'
                }
            });
            return tagihan.map(t => new Tagihan(t));
        } catch (error) {
            throw new Error(`Error finding upcoming due tagihan: ${error.message}`);
        }
    }

    // Update tagihan
    async update(updateData) {
        try {
            const updatedTagihan = await prisma.tagihan.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                }
            });
            Object.assign(this, updatedTagihan);
            return this;
        } catch (error) {
            throw new Error(`Error updating tagihan: ${error.message}`);
        }
    }

    // Delete tagihan
    async delete() {
        try {
            await prisma.tagihan.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting tagihan: ${error.message}`);
        }
    }

    // Get total paid amount
    async getTotalPaid() {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    tagihanId: this.id,
                    transactionStatus: { in: ['settlement', 'capture'] }
                }
            });

            const totalPaid = pembayaran.reduce((sum, p) => sum + parseFloat(p.jumlahBayar), 0);
            return totalPaid;
        } catch (error) {
            throw new Error(`Error getting total paid: ${error.message}`);
        }
    }

    // Get remaining amount
    async getRemainingAmount() {
        try {
            const totalPaid = await this.getTotalPaid();
            const totalAmount = parseFloat(this.jumlah);
            return Math.max(0, totalAmount - totalPaid);
        } catch (error) {
            throw new Error(`Error getting remaining amount: ${error.message}`);
        }
    }

    // Get payment percentage
    async getPaymentPercentage() {
        try {
            const totalPaid = await this.getTotalPaid();
            const totalAmount = parseFloat(this.jumlah);
            return totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
        } catch (error) {
            throw new Error(`Error getting payment percentage: ${error.message}`);
        }
    }

    // Check if tagihan is overdue
    isOverdue() {
        if (!this.tanggalJatuhTempo) return false;
        const today = new Date();
        const dueDate = new Date(this.tanggalJatuhTempo);
        return today > dueDate && this.status !== 'lunas';
    }

    // Check if tagihan is due soon
    isDueSoon(days = 7) {
        if (!this.tanggalJatuhTempo) return false;
        const today = new Date();
        const dueDate = new Date(this.tanggalJatuhTempo);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days && this.status !== 'lunas';
    }

    // Get days until due
    getDaysUntilDue() {
        if (!this.tanggalJatuhTempo) return null;
        const today = new Date();
        const dueDate = new Date(this.tanggalJatuhTempo);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Get tagihan status display name
    getStatusDisplay() {
        const statusMap = {
            'belum_bayar': 'Belum Bayar',
            'sebagian': 'Sebagian',
            'lunas': 'Lunas'
        };
        return statusMap[this.status] || this.status;
    }

    // Get tagihan statistics
    static async getStats() {
        try {
            const tagihan = await prisma.tagihan.findMany();

            const stats = {
                total: tagihan.length,
                belumBayar: tagihan.filter(t => t.status === 'belum_bayar').length,
                sebagian: tagihan.filter(t => t.status === 'sebagian').length,
                lunas: tagihan.filter(t => t.status === 'lunas').length,
                totalAmount: tagihan.reduce((sum, t) => sum + parseFloat(t.jumlah), 0)
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting tagihan stats: ${error.message}`);
        }
    }

    // Get tagihan info for display
    toJSON() {
        return {
            id: this.id,
            orangTuaId: this.orangTuaId,
            anakId: this.anakId,
            periodeBulan: this.periodeBulan,
            jumlah: this.jumlah,
            tanggalJatuhTempo: this.tanggalJatuhTempo,
            status: this.status,
            statusDisplay: this.getStatusDisplay(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isOverdue: this.isOverdue(),
            isDueSoon: this.isDueSoon(),
            daysUntilDue: this.getDaysUntilDue()
        };
    }

    // Get monthly periods for an anak from registration until current month
    static async getMonthlyPeriodsForAnak(anakId) {
        try {
            // Get anak data to find registration date
            const anak = await prisma.anak.findUnique({
                where: { id: parseInt(anakId) },
                include: { orangTua: true }
            });

            if (!anak) {
                throw new Error('Anak not found');
            }

            // Use tanggalMasuk or createdAt as start date
            const startDate = anak.tanggalMasuk || anak.createdAt;
            const currentDate = new Date();
            
            const periods = [];
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth(); // 0-based
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth(); // 0-based

            // Generate all periods from start date to current month
            for (let year = startYear; year <= currentYear; year++) {
                const startMonthForYear = (year === startYear) ? startMonth : 0;
                const endMonthForYear = (year === currentYear) ? currentMonth : 11;

                for (let month = startMonthForYear; month <= endMonthForYear; month++) {
                    const periodeBulan = `${year}-${String(month + 1).padStart(2, '0')}`;
                    periods.push(periodeBulan);
                }
            }

            return periods;
        } catch (error) {
            throw new Error(`Error getting monthly periods: ${error.message}`);
        }
    }

    // Get tagihan status for all periods of an anak for orang tua
    static async getTagihanPeriodsForOrangTua(orangTuaId) {
        try {
            // Get all anak for this orang tua
            const anakList = await prisma.anak.findMany({
                where: { 
                    orangTuaId: parseInt(orangTuaId),
                    status: 'aktif'
                }
            });

            const result = [];

            for (const anak of anakList) {
                // Get all periods for this anak
                const periods = await this.getMonthlyPeriodsForAnak(anak.id);
                
                // Get existing tagihan for this anak
                const existingTagihan = await prisma.tagihan.findMany({
                    where: {
                        anakId: anak.id,
                        orangTuaId: parseInt(orangTuaId)
                    },
                    include: {
                        pembayaran: true
                    }
                });

                // Create map of existing tagihan by periode
                const tagihanMap = {};
                existingTagihan.forEach(tagihan => {
                    tagihanMap[tagihan.periodeBulan] = new Tagihan(tagihan);
                });

                // Generate period data
                const periodData = periods.map(periode => {
                    const existingTagihan = tagihanMap[periode];
                    const [year, month] = periode.split('-');
                    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { 
                        month: 'long', 
                        year: 'numeric' 
                    });

                    return {
                        periode,
                        periodeName: monthName,
                        anak: {
                            id: anak.id,
                            nama: anak.nama
                        },
                        tagihan: existingTagihan || null,
                        hasTagihan: !!existingTagihan,
                        status: existingTagihan ? existingTagihan.status : 'belum_ada',
                        statusDisplay: existingTagihan ? existingTagihan.getStatusDisplay() : 'Belum Ada Tagihan',
                        jumlah: existingTagihan ? existingTagihan.jumlah : 1000000, // Default amount
                        canPay: !existingTagihan || existingTagihan.status !== 'lunas'
                    };
                });

                result.push({
                    anak: {
                        id: anak.id,
                        nama: anak.nama,
                        tanggalMasuk: anak.tanggalMasuk
                    },
                    periods: periodData
                });
            }

            return result;
        } catch (error) {
            throw new Error(`Error getting tagihan periods: ${error.message}`);
        }
    }

    // Find or create tagihan for a specific periode and anak
    static async findOrCreateTagihan(orangTuaId, anakId, periode, jumlah = 1000000) {
        try {
            // Check if tagihan already exists
            const existingTagihan = await prisma.tagihan.findFirst({
                where: {
                    orangTuaId: parseInt(orangTuaId),
                    anakId: parseInt(anakId),
                    periodeBulan: periode
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                }
            });

            if (existingTagihan) {
                return new Tagihan(existingTagihan);
            }

            // Create new tagihan
            const [year, month] = periode.split('-');
            const dueDate = new Date(parseInt(year), parseInt(month), 1); // 1st of the month

            const newTagihan = await prisma.tagihan.create({
                data: {
                    orangTuaId: parseInt(orangTuaId),
                    anakId: parseInt(anakId),
                    periodeBulan: periode,
                    jumlah: parseFloat(jumlah),
                    tanggalJatuhTempo: dueDate,
                    status: 'belum_bayar'
                },
                include: {
                    orangTua: true,
                    anak: true,
                    pembayaran: true
                }
            });

            return new Tagihan(newTagihan);
        } catch (error) {
            throw new Error(`Error finding or creating tagihan: ${error.message}`);
        }
    }
}

module.exports = Tagihan;