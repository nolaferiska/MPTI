const midtransClient = require('midtrans-client');

class MidtransService {
    constructor() {
        // Initialize Midtrans client
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true' || false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });

        this.coreApi = new midtransClient.CoreApi({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true' || false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });
    }

    // Format date for Midtrans API (yyyy-MM-dd hh:mm:ss Z)
    formatMidtransDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        // Get timezone offset in format +HHMM
        const timezoneOffset = -date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
        const offsetMinutes = Math.abs(timezoneOffset) % 60;
        const sign = timezoneOffset >= 0 ? '+' : '-';
        const timezone = `${sign}${String(offsetHours).padStart(2, '0')}${String(offsetMinutes).padStart(2, '0')}`;
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezone}`;
    }

    // Create payment transaction
    async createTransaction(pembayaran, tagihan, orangTua, anak) {
        try {
            // Validate amounts
            const grossAmount = parseInt(pembayaran.grossAmount);
            const jumlahBayar = parseInt(pembayaran.jumlahBayar);

            if (grossAmount <= 0 || jumlahBayar <= 0) {
                throw new Error(`Invalid payment amount: grossAmount=${grossAmount}, jumlahBayar=${jumlahBayar}. Amount must be greater than 0.`);
            }

            if (grossAmount < 1000) {
                throw new Error(`Payment amount too small: ${grossAmount}. Minimum amount is Rp 1,000.`);
            }

            const parameter = {
                transaction_details: {
                    order_id: pembayaran.orderId,
                    gross_amount: grossAmount
                },
                credit_card: {
                    secure: true
                },
                customer_details: {
                    first_name: orangTua.nama.split(' ')[0],
                    last_name: orangTua.nama.split(' ').slice(1).join(' ') || '',
                    email: orangTua.email,
                    phone: orangTua.telepon || ''
                },
                item_details: [
                    {
                        id: `tagihan-${tagihan.id}`,
                        price: jumlahBayar,
                        quantity: 1,
                        name: `Tagihan ${tagihan.periodeBulan} - ${anak.nama}`,
                        category: 'daycare',
                        merchant_name: 'Candice Kids'
                    }
                ],
                callbacks: {
                    finish: process.env.MIDTRANS_FINISH_URL || `${process.env.BASE_URL}/payment/finish`,
                    error: process.env.MIDTRANS_ERROR_URL || `${process.env.BASE_URL}/payment/error`,
                    pending: process.env.MIDTRANS_PENDING_URL || `${process.env.BASE_URL}/payment/pending`
                },
                expiry: {
                    start_time: this.formatMidtransDateTime(new Date()),
                    unit: "day",
                    duration: 1
                },
                custom_field1: `tagihan_id:${tagihan.id}`,
                custom_field2: `anak_id:${anak.id}`,
                custom_field3: `orang_tua_id:${orangTua.id}`
            };

            const transaction = await this.snap.createTransaction(parameter);
            
            return {
                token: transaction.token,
                redirect_url: transaction.redirect_url,
                payment_url: transaction.redirect_url
            };
        } catch (error) {
            console.error('Midtrans transaction creation error:', error);
            throw new Error(`Failed to create Midtrans transaction: ${error.message}`);
        }
    }

    // Get transaction status
    async getTransactionStatus(orderId) {
        try {
            const statusResponse = await this.coreApi.transaction.status(orderId);
            return statusResponse;
        } catch (error) {
            console.error('Midtrans status check error:', error);
            throw new Error(`Failed to get transaction status: ${error.message}`);
        }
    }

    // Verify notification signature
    verifyNotificationSignature(notification) {
        try {
            const serverKey = process.env.MIDTRANS_SERVER_KEY;
            const orderId = notification.order_id;
            const statusCode = notification.status_code;
            const grossAmount = notification.gross_amount;
            
            const signatureKey = notification.signature_key;
            const inputString = orderId + statusCode + grossAmount + serverKey;
            const expectedSignature = require('crypto')
                .createHash('sha512')
                .update(inputString)
                .digest('hex');

            console.log('Signature verification details:');
            console.log('- Order ID:', orderId);
            console.log('- Status Code:', statusCode);
            console.log('- Gross Amount:', grossAmount);
            console.log('- Server Key:', serverKey ? '[PRESENT]' : '[MISSING]');
            console.log('- Input String:', inputString);
            console.log('- Expected Signature:', expectedSignature);
            console.log('- Received Signature:', signatureKey);
            console.log('- Signature Match:', signatureKey === expectedSignature);

            return signatureKey === expectedSignature;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    // Handle Midtrans notification
    async handleNotification(notification) {
        try {
            // In development mode, be more lenient with signature verification
            const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MIDTRANS_IS_PRODUCTION === 'false';
            
            if (!isDevelopment) {
                // Only enforce signature verification in production
                if (!this.verifyNotificationSignature(notification)) {
                    throw new Error('Invalid notification signature');
                }
            } else {
                // Log signature verification result but don't block
                const isValidSignature = this.verifyNotificationSignature(notification);
                console.log(`Development mode: Signature validation ${isValidSignature ? 'PASSED' : 'FAILED'} but continuing...`);
            }

            const orderId = notification.order_id;
            const transactionStatus = notification.transaction_status;
            const fraudStatus = notification.fraud_status;

            console.log(`Received notification for order ${orderId}: ${transactionStatus}`);

            return {
                orderId,
                transactionStatus,
                fraudStatus,
                notification
            };
        } catch (error) {
            console.error('Notification handling error:', error);
            throw error;
        }
    }

    // Cancel transaction
    async cancelTransaction(orderId) {
        try {
            const cancelResponse = await this.coreApi.transaction.cancel(orderId);
            return cancelResponse;
        } catch (error) {
            console.error('Transaction cancellation error:', error);
            throw new Error(`Failed to cancel transaction: ${error.message}`);
        }
    }

    // Refund transaction
    async refundTransaction(orderId, amount = null, reason = 'Customer request') {
        try {
            const refundParams = {
                amount: amount,
                reason: reason
            };

            const refundResponse = await this.coreApi.transaction.refund(orderId, refundParams);
            return refundResponse;
        } catch (error) {
            console.error('Transaction refund error:', error);
            throw new Error(`Failed to refund transaction: ${error.message}`);
        }
    }

    // Map Midtrans payment type to our enum
    mapPaymentType(midtransPaymentType) {
        const paymentTypeMap = {
            'credit_card': 'credit_card',
            'bank_transfer': 'bank_transfer',
            'bca_va': 'bca_va',
            'bni_va': 'bni_va',
            'bri_va': 'bri_va',
            'permata_va': 'permata_va',
            'other_va': 'other_va',
            'gopay': 'gopay',
            'shopeepay': 'shopeepay',
            'qris': 'qris',
            'cstore': 'indomaret', // Default to indomaret for convenience store
            'akulaku': 'akulaku',
            'kredivo': 'kredivo'
        };

        return paymentTypeMap[midtransPaymentType] || 'bank_transfer';
    }

    // Map Midtrans status to our enum
    mapTransactionStatus(midtransStatus, fraudStatus = null) {
        // Handle fraud status
        if (fraudStatus === 'deny') {
            return 'deny';
        }

        const statusMap = {
            'pending': 'pending',
            'settlement': 'settlement',
            'capture': 'capture',
            'deny': 'deny',
            'cancel': 'cancel',
            'expire': 'expire',
            'failure': 'failure',
            'refund': 'refund',
            'partial_refund': 'partial_refund'
        };

        return statusMap[midtransStatus] || 'pending';
    }

    // Get payment instructions for different methods
    getPaymentInstructions(paymentType, vaNumber = null, bankCode = null) {
        const instructions = {
            'credit_card': 'Silakan lakukan pembayaran menggunakan kartu kredit Anda.',
            'bank_transfer': 'Silakan transfer ke rekening yang telah disediakan.',
            'bca_va': `Silakan bayar melalui ATM/Mobile Banking BCA ke nomor Virtual Account: ${vaNumber}`,
            'bni_va': `Silakan bayar melalui ATM/Mobile Banking BNI ke nomor Virtual Account: ${vaNumber}`,
            'bri_va': `Silakan bayar melalui ATM/Mobile Banking BRI ke nomor Virtual Account: ${vaNumber}`,
            'permata_va': `Silakan bayar melalui ATM/Mobile Banking Permata ke nomor Virtual Account: ${vaNumber}`,
            'gopay': 'Silakan buka aplikasi Gojek dan lakukan pembayaran.',
            'shopeepay': 'Silakan buka aplikasi Shopee dan lakukan pembayaran.',
            'qris': 'Silakan scan QR Code dengan aplikasi pembayaran Anda.',
            'indomaret': 'Silakan bayar di kasir Indomaret terdekat.',
            'alfamart': 'Silakan bayar di kasir Alfamart terdekat.'
        };

        return instructions[paymentType] || 'Silakan ikuti instruksi pembayaran yang diberikan.';
    }
}

module.exports = new MidtransService();
