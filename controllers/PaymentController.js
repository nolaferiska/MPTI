const { Tagihan, Pembayaran } = require('../models');
const MidtransService = require('../services/MidtransService');

class PaymentController {
    // Show tagihan page for orang tua - List of children with summary
    static async showTagihan(req, res) {
        try {
            const orangTuaId = req.session.user.id;
            console.log('ShowTagihan - OrangTua ID:', orangTuaId);

            // Get tagihan periods for all anak of this orang tua
            const tagihanPeriods = await Tagihan.getTagihanPeriodsForOrangTua(orangTuaId);
            console.log('ShowTagihan - Tagihan periods:', JSON.stringify(tagihanPeriods, null, 2));

            // Transform data to anak list with summary stats
            const anakList = tagihanPeriods.map(anakData => {
                const totalPeriods = anakData.periods.length;
                const belumBayar = anakData.periods.filter(p => p.status === 'belum_bayar' || p.status === 'belum_ada').length;
                const lunas = anakData.periods.filter(p => p.status === 'lunas').length;
                const totalTagihan = anakData.periods.reduce((sum, p) => sum + parseInt(p.jumlah), 0);

                return {
                    ...anakData.anak,
                    totalPeriods,
                    belumBayar,
                    lunas,
                    totalTagihan,
                    currentUserId: req.session.user.id

                };
            });

            // Calculate overall summary stats
            const totalBelumBayar = anakList.reduce((sum, anak) => sum + anak.belumBayar, 0);
            const totalLunas = anakList.reduce((sum, anak) => sum + anak.lunas, 0);
            const totalTagihan = anakList.reduce((sum, anak) => sum + anak.totalTagihan, 0);

            res.render('orangTua/tagihan', {
                title: 'Tagihan & Pembayaran - Candice Kids',
                layout: 'layouts/orangTua',
                anakList: anakList,
                totalBelumBayar: totalBelumBayar,
                totalLunas: totalLunas,
                totalTagihan: totalTagihan,
                currentUserId: req.session.user.id,
                tagihanPeriods: tagihanPeriods
            });
        } catch (error) {
            console.error('Error fetching tagihan:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat tagihan');
            res.redirect('/dashboard');
        }
    }

    // Create payment transaction
    static async createPayment(req, res) {
        try {
            const { tagihanId, anakId, periode, amount } = req.body;
            const orangTuaId = req.session.user.id;

            console.log('Creating payment request:', { tagihanId, anakId, periode, amount, orangTuaId });

            let tagihan;

            // If tagihanId is provided, use existing tagihan
            if (tagihanId) {
                tagihan = await Tagihan.findById(tagihanId);
                if (!tagihan) {
                    console.log('Tagihan not found:', tagihanId);
                    return res.status(404).json({
                        success: false,
                        message: 'Tagihan tidak ditemukan'
                    });
                }
            } 
            // If anakId and periode are provided, find or create tagihan
            else if (anakId && periode) {
                
                const jumlahTagihan = amount || 1000000; // Default amount
                tagihan = await Tagihan.findOrCreateTagihan(orangTuaId, anakId, periode, jumlahTagihan);
                console.log('Found or created tagihan:', tagihan.id);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter tidak lengkap. Diperlukan tagihanId atau anakId + periode'
                });
            }

            // Verify tagihan belongs to current user
            if (tagihan.orangTuaId !== orangTuaId) {
                console.log('Tagihan access denied. Owner:', tagihan.orangTuaId, 'Requestor:', orangTuaId);
                return res.status(403).json({
                    success: false,
                    message: 'Akses ditolak'
                });
            }

            // Refresh tagihan status before checking if it's paid
            await PaymentController.updateTagihanStatus(tagihan);

            // Check if tagihan is already paid
            if (tagihan.status === 'lunas') {
                console.log('Tagihan already paid:', tagihan.id);
                return res.status(400).json({
                    success: false,
                    message: 'Tagihan sudah lunas'
                });
            }

            // Check for existing pending payment
            const existingPayments = await Pembayaran.findByTagihan(tagihan.id, {
                where: { transactionStatus: 'pending' }
            });

            let pembayaran;
            let remainingAmount;

            // Always calculate the remaining amount first
            remainingAmount = await tagihan.getRemainingAmount();
            console.log('Tagihan total amount:', tagihan.jumlah);
            console.log('Remaining amount for tagihan:', remainingAmount);
            console.log('Tagihan current status:', tagihan.status);

            if (remainingAmount <= 0) {
                console.log('No remaining amount to pay. Tagihan may already be paid.');
                return res.status(400).json({
                    success: false,
                    message: 'Tagihan sudah lunas atau tidak ada sisa tagihan yang perlu dibayar'
                });
            }

            if (existingPayments && existingPayments.length > 0) {
                // Check if existing payment is still valid (not expired)
                const validPayment = existingPayments.find(payment => {
                    const isNotExpired = !payment.expiredAt || new Date(payment.expiredAt) > new Date();
                    const isPending = payment.transactionStatus === 'pending';
                    return isPending && isNotExpired;
                });

                if (validPayment) {
                    // Use existing valid payment
                    console.log('Using existing valid payment:', validPayment.orderId);
                    
                    // Check if payment URL still exists and not expired
                    if (validPayment.paymentUrl) {
                        console.log('Redirecting to existing payment URL');
                        return res.json({
                            success: true,
                            redirect_url: validPayment.paymentUrl,
                            redirectUrl: validPayment.paymentUrl,
                            orderId: validPayment.orderId,
                            message: 'Menggunakan pembayaran yang sudah ada'
                        });
                    }
                    
                    // If no payment URL, we'll use this payment object for new Midtrans transaction
                    pembayaran = validPayment;
                    console.log('Reusing existing payment object for new Midtrans transaction');
                } else {
                    // Cancel expired or invalid pending payments
                    console.log('Found expired/invalid pending payments. Canceling them...');
                    for (const existingPayment of existingPayments) {
                        try {
                            await MidtransService.cancelTransaction(existingPayment.orderId);
                            await existingPayment.update({ transactionStatus: 'cancel' });
                            console.log('Canceled expired payment:', existingPayment.orderId);
                        } catch (cancelError) {
                            console.log('Could not cancel existing payment (may already be expired):', existingPayment.orderId);
                            // Mark as expired instead
                            await existingPayment.update({ transactionStatus: 'expire' });
                        }
                    }
                    pembayaran = null; // Will create new payment below
                }
            }

            // Create new payment only if we don't have a valid existing one
            if (!pembayaran) {
                console.log('Creating new payment. Remaining amount:', remainingAmount);
                
                // Generate unique order ID
                const orderId = `CANDICE-${tagihan.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                
                pembayaran = await Pembayaran.create({
                    tagihanId: parseInt(tagihan.id),
                    jumlahBayar: remainingAmount,
                    grossAmount: remainingAmount,
                    orderId: orderId,
                    transactionStatus: 'pending'
                });
                console.log('Created new payment:', pembayaran.orderId);
            } else {
                console.log('Using existing payment:', pembayaran.orderId, 'with amount:', pembayaran.jumlahBayar);
                
                // Verify that existing payment amount matches current remaining amount
                if (parseFloat(pembayaran.jumlahBayar) !== remainingAmount) {
                    console.log(`Payment amount mismatch. Existing: ${pembayaran.jumlahBayar}, Required: ${remainingAmount}`);
                    console.log('Updating existing payment amount to match remaining amount');
                    
                    await pembayaran.update({
                        jumlahBayar: remainingAmount,
                        grossAmount: remainingAmount
                    });
                }
            }

            // Get related data for Midtrans
            const orangTua = req.session.user;
            
            // Get actual anak data from database
            const anak = await require('../lib/prisma').anak.findUnique({
                where: { id: tagihan.anakId }
            });

            if (!anak) {
                console.log('Anak not found for tagihan:', tagihan.anakId);
                return res.status(404).json({
                    success: false,
                    message: 'Data anak tidak ditemukan'
                });
            }

            // Double check amount before creating Midtrans transaction
            const finalAmount = parseFloat(pembayaran.jumlahBayar);
            if (finalAmount <= 0) {
                console.log(`Invalid payment amount: ${finalAmount}. Cannot create Midtrans transaction.`);
                return res.status(400).json({
                    success: false,
                    message: 'Jumlah pembayaran tidak valid. Tagihan mungkin sudah lunas.'
                });
            }

            // Create Midtrans transaction
            console.log('Creating Midtrans transaction with amount:', finalAmount);
            const transaction = await MidtransService.createTransaction(
                pembayaran, 
                tagihan, 
                orangTua, 
                anak
            );

            console.log('Midtrans transaction created successfully:', transaction.token);

            // Update pembayaran with payment URL and expiry
            await pembayaran.update({
                paymentUrl: transaction.redirect_url,
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            });

            // Return JSON response for AJAX
            return res.json({
                success: true,
                snapToken: transaction.token,
                redirectUrl: transaction.redirect_url,
                orderId: pembayaran.orderId,
                message: 'Transaksi berhasil dibuat'
            });

        } catch (error) {
            console.error('Error creating payment:', error);
            
            // Always return JSON response
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat membuat pembayaran: ' + error.message
            });
        }
    }

    // Handle payment finish (success)
    static async paymentFinish(req, res) {
        const { order_id, status_code, transaction_status } = req.query;

        try {
            console.log(`🏁 Payment finish callback: order_id=${order_id}, status=${transaction_status}`);

            // Find pembayaran and update tagihan status if needed
            if (order_id) {
                const pembayaran = await Pembayaran.findByOrderId(order_id);
                if (pembayaran) {
                    console.log(`📋 Found pembayaran ${pembayaran.id} for order ${order_id}`);
                    
                    // Get and update tagihan status
                    const tagihan = await Tagihan.findById(pembayaran.tagihanId);
                    if (tagihan) {
                        console.log(`📄 Updating tagihan ${tagihan.id} status after payment finish`);
                        await PaymentController.updateTagihanStatus(tagihan);
                    }
                }
            }

            if (transaction_status === 'settlement' || transaction_status === 'capture') {
                req.flash('success_msg', 'Pembayaran berhasil! Tagihan Anda telah lunas.');
            } else if (transaction_status === 'pending') {
                req.flash('info_msg', 'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.');
            } 

            res.redirect('/tagihan');
        } catch (error) {
            console.error('Error in payment finish:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memproses hasil pembayaran');
            res.redirect('/tagihan');
        }
    }

    // Handle payment error
    static async paymentError(req, res) {
        req.flash('error_msg', 'Terjadi kesalahan saat melakukan pembayaran. Silakan coba lagi.');
        res.redirect('/tagihan');
    }

    // Handle payment pending
    static async paymentPending(req, res) {
        req.flash('info_msg', 'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi atau lakukan pembayaran sesuai instruksi.');
        res.redirect('/tagihan');
    }

    // Handle Midtrans notification webhook
    static async paymentNotification(req, res) {
        try {
            console.log('🔔 Received Midtrans notification:', req.body);

            // Handle the notification
            const notificationResult = await MidtransService.handleNotification(req.body);
            const { orderId, transactionStatus, notification } = notificationResult;

            console.log(`📋 Processing notification for order ${orderId} with status ${transactionStatus}`);

            // Find pembayaran by order ID
            const pembayaran = await Pembayaran.findByOrderId(orderId);
            if (!pembayaran) {
                console.log(`⚠️ Pembayaran not found for order: ${orderId} (this might be a test notification)`);
                
                // For test notifications or unknown orders, still return success to avoid retries
                return res.status(200).json({ 
                    status: 'ok', 
                    message: 'Notification received but no matching payment found' 
                });
            }

            console.log(`💳 Found pembayaran: ${pembayaran.id} for tagihan: ${pembayaran.tagihanId}`);

            // Update pembayaran with Midtrans data
            await pembayaran.updateFromMidtrans(notification);
            console.log(`✅ Pembayaran ${pembayaran.id} updated with status: ${transactionStatus}`);

            // Get fresh tagihan data and update status
            const tagihan = await Tagihan.findById(pembayaran.tagihanId);
            if (tagihan) {
                console.log(`📄 Updating status for tagihan ${tagihan.id}`);
                await PaymentController.updateTagihanStatus(tagihan);
                console.log(`🎯 Tagihan status update completed`);
            } else {
                console.log(`❌ Tagihan not found for ID: ${pembayaran.tagihanId}`);
            }

            console.log(`✅ Payment notification processed successfully for order ${orderId}`);
            res.status(200).json({ status: 'ok' });

        } catch (error) {
            console.error('❌ Error handling Midtrans notification:', error);
            
            // Even if there's an error, return 200 to prevent Midtrans from retrying
            // unless it's a critical validation error
            if (error.message.includes('Invalid notification signature') && process.env.NODE_ENV === 'production') {
                return res.status(400).json({ status: 'error', message: 'Invalid signature' });
            }
            
            res.status(200).json({ status: 'error', message: 'Notification processed with errors' });
        }
    }

    // Update tagihan status based on payments
    static async updateTagihanStatus(tagihan) {
        try {
            console.log(`Updating tagihan status for tagihan ID: ${tagihan.id}`);
            
            // Get all payments for this tagihan with fresh data from database
            const allPayments = await Pembayaran.findByTagihan(tagihan.id);
            console.log(`Found ${allPayments.length} payments for tagihan ${tagihan.id}`);
            
            // Calculate total successful payments
            const successfulPayments = allPayments.filter(p => {
                const isSuccessful = ['settlement', 'capture'].includes(p.transactionStatus);
                console.log(`Payment ${p.orderId}: status=${p.transactionStatus}, successful=${isSuccessful}, amount=${p.jumlahBayar}`);
                return isSuccessful;
            });
            
            const totalPaid = successfulPayments.reduce((sum, p) => 
                sum + parseFloat(p.jumlahBayar), 0
            );
            
            const totalAmount = parseFloat(tagihan.jumlah);
            let newStatus = 'belum_bayar';

            console.log(`Payment calculation: totalPaid=${totalPaid}, totalAmount=${totalAmount}`);

            if (totalPaid >= totalAmount) {
                newStatus = 'lunas';
            } else if (totalPaid > 0) {
                newStatus = 'sebagian';
            }

            console.log(`Current status: ${tagihan.status}, New status: ${newStatus}`);

            if (tagihan.status !== newStatus) {
                // Use Prisma directly to ensure the update happens
                const updatedTagihan = await require('../lib/prisma').tagihan.update({
                    where: { id: tagihan.id },
                    data: { status: newStatus }
                });
                
                console.log(`✅ Tagihan ${tagihan.id} status updated from ${tagihan.status} to ${newStatus}`);
                
                // Update the tagihan object
                tagihan.status = newStatus;
                
                return updatedTagihan;
            } else {
                console.log(`No status update needed for tagihan ${tagihan.id}`);
            }

        } catch (error) {
            console.error('❌ Error updating tagihan status:', error);
            throw error; // Re-throw to ensure we know about failures
        }
    }

    // Check payment status (for AJAX calls)
    static async checkPaymentStatus(req, res) {
        try {
            const { orderId } = req.params;
            
            const pembayaran = await Pembayaran.findByOrderId(orderId);
            if (!pembayaran) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            // Get latest status from Midtrans
            try {
                const midtransStatus = await MidtransService.getTransactionStatus(orderId);
                await pembayaran.updateFromMidtrans(midtransStatus);
                
                // Update tagihan status
                const tagihan = await Tagihan.findById(pembayaran.tagihanId);
                if (tagihan) {
                    await PaymentController.updateTagihanStatus(tagihan);
                }
            } catch (midtransError) {
                console.error('Error getting Midtrans status:', midtransError);
                // Continue with existing data
            }

            res.json({
                orderId: pembayaran.orderId,
                transactionStatus: pembayaran.transactionStatus,
                statusDisplay: pembayaran.getStatusDisplay(),
                paymentType: pembayaran.paymentType,
                paymentTypeDisplay: pembayaran.getPaymentTypeDisplay(),
                jumlahBayar: pembayaran.jumlahBayar,
                transactionTime: pembayaran.transactionTime
            });

        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Cancel payment
    static async cancelPayment(req, res) {
        try {
            const { orderId } = req.params;
            const orangTuaId = req.session.user.id;

            const pembayaran = await Pembayaran.findByOrderId(orderId);
            if (!pembayaran) {
                req.flash('error_msg', 'Pembayaran tidak ditemukan');
                return res.redirect('/tagihan');
            }

            // Verify ownership
            const tagihan = await Tagihan.findById(pembayaran.tagihanId);
            if (!tagihan || tagihan.orangTuaId !== orangTuaId) {
                req.flash('error_msg', 'Akses ditolak');
                return res.redirect('/tagihan');
            }

            // Only cancel if still pending
            if (pembayaran.transactionStatus === 'pending') {
                try {
                    await MidtransService.cancelTransaction(orderId);
                    await pembayaran.update({ transactionStatus: 'cancel' });
                    req.flash('success_msg', 'Pembayaran berhasil dibatalkan');
                } catch (cancelError) {
                    console.error('Error canceling payment:', cancelError);
                    req.flash('error_msg', 'Gagal membatalkan pembayaran');
                }
            } else {
                req.flash('error_msg', 'Pembayaran tidak dapat dibatalkan');
            }

            res.redirect(`/tagihan/detail/${pembayaran.tagihanId}`);

        } catch (error) {
            console.error('Error canceling payment:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat membatalkan pembayaran');
            res.redirect('/tagihan');
        }
    }

    // Show tagihan detail for specific anak
    static async showTagihanAnak(req, res) {
        try {
            const anakId = req.params.anakId;
            const orangTuaId = req.session.user.id;

            console.log('ShowTagihanAnak - Anak ID:', anakId, 'OrangTua ID:', orangTuaId);

            // Verify anak belongs to current user
            const anak = await require('../lib/prisma').anak.findUnique({
                where: { 
                    id: parseInt(anakId),
                    orangTuaId: parseInt(orangTuaId)
                }
            });

            if (!anak) {
                req.flash('error_msg', 'Anak tidak ditemukan atau bukan milik Anda');
                return res.redirect('/tagihan');
            }

            // Get tagihan periods for this specific anak
            const allTagihanPeriods = await Tagihan.getTagihanPeriodsForOrangTua(orangTuaId);
            const anakData = allTagihanPeriods.find(data => data.anak.id === parseInt(anakId));

            if (!anakData) {
                req.flash('error_msg', 'Data tagihan tidak ditemukan');
                return res.redirect('/tagihan');
            }

            console.log('ShowTagihanAnak - Found periods:', anakData.periods.length);

            res.render('orangTua/tagihan-detail', {
                title: `Tagihan ${anakData.anak.nama} - Candice Kids`,
                layout: 'layouts/orangTua',
                anak: anakData.anak,
                periods: anakData.periods,
                currentUserId: req.session.user.id
            });
        } catch (error) {
            console.error('Error fetching tagihan anak:', error);
            req.flash('error_msg', 'Terjadi kesalahan saat memuat tagihan');
            res.redirect('/tagihan');
        }
    }
}

module.exports = PaymentController;
