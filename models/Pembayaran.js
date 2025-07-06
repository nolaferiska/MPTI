const prisma = require('../lib/prisma');

class Pembayaran {
    constructor(data) {
        this.id = data.id;
        this.tagihanId = data.tagihanId;
        this.jumlahBayar = data.jumlahBayar;
        this.orderId = data.orderId;
        this.transactionId = data.transactionId;
        this.grossAmount = data.grossAmount;
        this.paymentType = data.paymentType;
        this.transactionTime = data.transactionTime;
        this.transactionStatus = data.transactionStatus;
        this.fraudStatus = data.fraudStatus;
        this.bankCode = data.bankCode;
        this.vaNumber = data.vaNumber;
        this.paymentUrl = data.paymentUrl;
        this.expiredAt = data.expiredAt;
        this.keterangan = data.keterangan;
        this.midtransResponse = data.midtransResponse;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        
        // Include relations if present
        if (data.tagihan) this.tagihan = data.tagihan;
    }

    // Create new pembayaran with Midtrans order ID
    static async create(pembayaranData) {
        try {
            // Generate unique order ID if not provided
            if (!pembayaranData.orderId) {
                const timestamp = Date.now();
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                pembayaranData.orderId = `CANDICE-${pembayaranData.tagihanId}-${timestamp}-${random}`;
            }

            // Set grossAmount to jumlahBayar if not provided (no additional fees for now)
            if (!pembayaranData.grossAmount) {
                pembayaranData.grossAmount = pembayaranData.jumlahBayar;
            }

            const pembayaran = await prisma.pembayaran.create({
                data: pembayaranData,
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                }
            });
            return new Pembayaran(pembayaran);
        } catch (error) {
            throw new Error(`Error creating pembayaran: ${error.message}`);
        }
    }

    // Find pembayaran by ID
    static async findById(id) {
        try {
            const pembayaran = await prisma.pembayaran.findUnique({
                where: { id: parseInt(id) },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                }
            });
            return pembayaran ? new Pembayaran(pembayaran) : null;
        } catch (error) {
            throw new Error(`Error finding pembayaran: ${error.message}`);
        }
    }

    // Find pembayaran by order ID (for Midtrans)
    static async findByOrderId(orderId) {
        try {
            const pembayaran = await prisma.pembayaran.findUnique({
                where: { orderId: orderId },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                }
            });
            return pembayaran ? new Pembayaran(pembayaran) : null;
        } catch (error) {
            throw new Error(`Error finding pembayaran by order ID: ${error.message}`);
        }
    }

    // Find pembayaran by transaction ID (for Midtrans)
    static async findByTransactionId(transactionId) {
        try {
            const pembayaran = await prisma.pembayaran.findFirst({
                where: { transactionId: transactionId },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                }
            });
            return pembayaran ? new Pembayaran(pembayaran) : null;
        } catch (error) {
            throw new Error(`Error finding pembayaran by transaction ID: ${error.message}`);
        }
    }

    // Get all pembayaran
    static async findAll(options = {}) {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: options.where,
                include: options.include || {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: options.orderBy || {
                    createdAt: 'desc'
                },
                skip: options.skip,
                take: options.take
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pembayaran: ${error.message}`);
        }
    }

    // Get pembayaran by tagihan
    static async findByTagihan(tagihanId, options = {}) {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    tagihanId: parseInt(tagihanId),
                    ...options.where
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pembayaran by tagihan: ${error.message}`);
        }
    }

    // Get pembayaran by transaction status
    static async findByStatus(transactionStatus, options = {}) {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    transactionStatus,
                    ...options.where
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pembayaran by status: ${error.message}`);
        }
    }

    // Get pembayaran by payment type
    static async findByPaymentType(paymentType, options = {}) {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    paymentType,
                    ...options.where
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pembayaran by payment type: ${error.message}`);
        }
    }

    // Get pembayaran by date range
    static async findByDateRange(startDate, endDate, options = {}) {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    transactionTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...options.where
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    transactionTime: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pembayaran by date range: ${error.message}`);
        }
    }

    // Get pending pembayaran
    static async findPending() {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    transactionStatus: 'pending'
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding pending pembayaran: ${error.message}`);
        }
    }

    // Get successful pembayaran (settlement or capture)
    static async findSuccessful() {
        try {
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    transactionStatus: {
                        in: ['settlement', 'capture']
                    }
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    transactionTime: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding successful pembayaran: ${error.message}`);
        }
    }

    // Get expired pembayaran
    static async findExpired() {
        try {
            const now = new Date();
            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    OR: [
                        { 
                            transactionStatus: 'expire' 
                        },
                        {
                            AND: [
                                { transactionStatus: 'pending' },
                                { expiredAt: { lt: now } }
                            ]
                        }
                    ]
                },
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return pembayaran.map(p => new Pembayaran(p));
        } catch (error) {
            throw new Error(`Error finding expired pembayaran: ${error.message}`);
        }
    }

    // Update pembayaran (for Midtrans callback)
    async update(updateData) {
        try {
            console.log(`🔄 Updating pembayaran ${this.id} with data:`, updateData);
            
            const updatedPembayaran = await prisma.pembayaran.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    tagihan: {
                        include: {
                            orangTua: true,
                            anak: true
                        }
                    }
                }
            });
            
            console.log(`✅ Pembayaran ${this.id} updated in database successfully`);
            
            Object.assign(this, updatedPembayaran);
            return this;
        } catch (error) {
            console.error(`❌ Error updating pembayaran ${this.id}:`, error);
            throw new Error(`Error updating pembayaran: ${error.message}`);
        }
    }

    // Update transaction status from Midtrans notification
    async updateFromMidtrans(midtransData) {
        try {
            console.log(`🔄 Updating pembayaran ${this.id} from Midtrans data:`, {
                order_id: midtransData.order_id,
                transaction_status: midtransData.transaction_status,
                transaction_id: midtransData.transaction_id,
                payment_type: midtransData.payment_type
            });

            const updateData = {
                transactionId: midtransData.transaction_id,
                transactionTime: midtransData.transaction_time ? new Date(midtransData.transaction_time) : null,
                transactionStatus: midtransData.transaction_status,
                fraudStatus: midtransData.fraud_status || null,
                paymentType: midtransData.payment_type || null,
                bankCode: midtransData.va_numbers?.[0]?.bank || midtransData.permata_va_number ? 'permata' : null,
                vaNumber: midtransData.va_numbers?.[0]?.va_number || midtransData.permata_va_number || null,
                midtransResponse: JSON.stringify(midtransData)
            };

            console.log(`💾 Updating pembayaran with data:`, updateData);

            const result = await this.update(updateData);
            
            console.log(`✅ Pembayaran ${this.id} updated successfully with status: ${this.transactionStatus}`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error updating pembayaran ${this.id} from Midtrans:`, error);
            throw new Error(`Error updating from Midtrans: ${error.message}`);
        }
    }

    // Delete pembayaran
    async delete() {
        try {
            await prisma.pembayaran.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting pembayaran: ${error.message}`);
        }
    }

    // Check if pembayaran is pending
    isPending() {
        return this.transactionStatus === 'pending';
    }

    // Check if pembayaran is successful (settlement or capture)
    isSuccessful() {
        return ['settlement', 'capture'].includes(this.transactionStatus);
    }

    // Check if pembayaran is failed
    isFailed() {
        return ['deny', 'cancel', 'expire', 'failure'].includes(this.transactionStatus);
    }

    // Check if pembayaran is expired
    isExpired() {
        if (this.transactionStatus === 'expire') return true;
        if (this.expiredAt && new Date() > new Date(this.expiredAt)) return true;
        return false;
    }

    // Check if pembayaran has payment URL
    hasPaymentUrl() {
        return !!this.paymentUrl;
    }

    // Check if payment is refunded
    isRefunded() {
        return ['refund', 'partial_refund'].includes(this.transactionStatus);
    }

    // Get payment type display name
    getPaymentTypeDisplay() {
        const paymentTypeMap = {
            'credit_card': 'Kartu Kredit',
            'bank_transfer': 'Transfer Bank',
            'bca_va': 'BCA Virtual Account',
            'bni_va': 'BNI Virtual Account', 
            'bri_va': 'BRI Virtual Account',
            'permata_va': 'Permata Virtual Account',
            'other_va': 'Virtual Account',
            'gopay': 'GoPay',
            'shopeepay': 'ShopeePay',
            'qris': 'QRIS',
            'indomaret': 'Indomaret',
            'alfamart': 'Alfamart',
            'akulaku': 'Akulaku',
            'kredivo': 'Kredivo'
        };
        return paymentTypeMap[this.paymentType] || this.paymentType || 'Unknown';
    }

    // Get transaction status display name
    getStatusDisplay() {
        const statusMap = {
            'pending': 'Menunggu Pembayaran',
            'settlement': 'Berhasil',
            'capture': 'Berhasil',
            'deny': 'Ditolak',
            'cancel': 'Dibatalkan',
            'expire': 'Kadaluarsa',
            'failure': 'Gagal',
            'refund': 'Dikembalikan',
            'partial_refund': 'Dikembalikan Sebagian'
        };
        return statusMap[this.transactionStatus] || this.transactionStatus;
    }

    // Get status color for UI
    getStatusColor() {
        const colorMap = {
            'pending': 'yellow',
            'settlement': 'green',
            'capture': 'green',
            'deny': 'red',
            'cancel': 'gray',
            'expire': 'red',
            'failure': 'red',
            'refund': 'blue',
            'partial_refund': 'blue'
        };
        return colorMap[this.transactionStatus] || 'gray';
    }

    // Get pembayaran statistics
    static async getStats() {
        try {
            const pembayaran = await prisma.pembayaran.findMany();

            const stats = {
                total: pembayaran.length,
                pending: pembayaran.filter(p => p.transactionStatus === 'pending').length,
                successful: pembayaran.filter(p => ['settlement', 'capture'].includes(p.transactionStatus)).length,
                failed: pembayaran.filter(p => ['deny', 'cancel', 'expire', 'failure'].includes(p.transactionStatus)).length,
                refunded: pembayaran.filter(p => ['refund', 'partial_refund'].includes(p.transactionStatus)).length,
                totalAmount: pembayaran.reduce((sum, p) => sum + parseFloat(p.jumlahBayar), 0),
                successfulAmount: pembayaran
                    .filter(p => ['settlement', 'capture'].includes(p.transactionStatus))
                    .reduce((sum, p) => sum + parseFloat(p.jumlahBayar), 0),
                
                // Payment type statistics
                creditCard: pembayaran.filter(p => p.paymentType === 'credit_card').length,
                bankTransfer: pembayaran.filter(p => p.paymentType === 'bank_transfer').length,
                virtualAccount: pembayaran.filter(p => p.paymentType?.includes('_va')).length,
                ewallet: pembayaran.filter(p => ['gopay', 'shopeepay'].includes(p.paymentType)).length,
                qris: pembayaran.filter(p => p.paymentType === 'qris').length,
                convenience: pembayaran.filter(p => ['indomaret', 'alfamart'].includes(p.paymentType)).length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting pembayaran stats: ${error.message}`);
        }
    }

    // Get monthly pembayaran statistics
    static async getMonthlyStats(year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const pembayaran = await prisma.pembayaran.findMany({
                where: {
                    transactionTime: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            const stats = {
                year,
                month,
                total: pembayaran.length,
                pending: pembayaran.filter(p => p.transactionStatus === 'pending').length,
                successful: pembayaran.filter(p => ['settlement', 'capture'].includes(p.transactionStatus)).length,
                failed: pembayaran.filter(p => ['deny', 'cancel', 'expire', 'failure'].includes(p.transactionStatus)).length,
                totalAmount: pembayaran.reduce((sum, p) => sum + parseFloat(p.jumlahBayar), 0),
                successfulAmount: pembayaran
                    .filter(p => ['settlement', 'capture'].includes(p.transactionStatus))
                    .reduce((sum, p) => sum + parseFloat(p.jumlahBayar), 0)
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting monthly pembayaran stats: ${error.message}`);
        }
    }

    // Get pembayaran info for display
    toJSON() {
        return {
            id: this.id,
            tagihanId: this.tagihanId,
            orderId: this.orderId,
            transactionId: this.transactionId,
            jumlahBayar: this.jumlahBayar,
            grossAmount: this.grossAmount,
            paymentType: this.paymentType,
            paymentTypeDisplay: this.getPaymentTypeDisplay(),
            transactionTime: this.transactionTime,
            transactionStatus: this.transactionStatus,
            statusDisplay: this.getStatusDisplay(),
            statusColor: this.getStatusColor(),
            fraudStatus: this.fraudStatus,
            bankCode: this.bankCode,
            vaNumber: this.vaNumber,
            paymentUrl: this.paymentUrl,
            expiredAt: this.expiredAt,
            keterangan: this.keterangan,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isPending: this.isPending(),
            isSuccessful: this.isSuccessful(),
            isFailed: this.isFailed(),
            isExpired: this.isExpired(),
            hasPaymentUrl: this.hasPaymentUrl()
        };
    }
}

module.exports = Pembayaran;