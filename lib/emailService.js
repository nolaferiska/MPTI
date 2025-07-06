const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Konfigurasi transporter email
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Bisa diganti dengan service lain
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // Verify transporter configuration
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Email configuration error:', error);
            } else {
                console.log('Email service ready to send messages');
            }
        });
    }

    // Send emergency notification email
    async sendEmergencyNotification(notifikasi, anak, orangTua) {
        try {
            const mailOptions = {
                from: {
                    name: 'Candice Kids Daycare',
                    address: process.env.EMAIL_USER || 'noreply@candicekids.com'
                },
                to: orangTua.email,
                subject: `🚨 NOTIFIKASI DARURAT - ${anak.nama}`,
                html: this.generateEmergencyEmailTemplate(notifikasi, anak, orangTua)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Emergency notification sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Failed to send emergency notification:', error);
            throw new Error(`Failed to send emergency notification: ${error.message}`);
        }
    }

    // Generate emergency email template
    generateEmergencyEmailTemplate(notifikasi, anak, orangTua) {
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notifikasi Darurat - Candice Kids</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .container {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #dc3545, #e74c3c);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: bold;
                }
                .alert-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                }
                .content {
                    padding: 30px 20px;
                }
                .child-info {
                    background-color: #f8f9fa;
                    border-left: 4px solid #007bff;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }
                .notification-box {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .urgent-label {
                    background-color: #dc3545;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    display: inline-block;
                    margin-bottom: 15px;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid #dee2e6;
                }
                .contact-info {
                    background-color: #e3f2fd;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .btn {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .btn:hover {
                    background-color: #0056b3;
                }
                .timestamp {
                    color: #6c757d;
                    font-size: 14px;
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🚨</div>
                    <h1>NOTIFIKASI DARURAT</h1>
                    <p>Informasi Penting Mengenai Anak Anda</p>
                </div>
                
                <div class="content">
                    <span class="urgent-label">SEGERA</span>
                    
                    <h2>Yth. ${orangTua.nama},</h2>
                    
                    <p>Kami ingin menginformasikan kepada Anda mengenai situasi yang memerlukan perhatian terkait dengan anak Anda:</p>
                    
                    <div class="child-info">
                        <h3>👶 Informasi Anak</h3>
                        <p><strong>Nama:</strong> ${anak.nama}</p>
                        <p><strong>Umur:</strong> ${anak.getAge ? anak.getAge() + ' tahun' : 'N/A'}</p>
                        <p><strong>Tanggal Lahir:</strong> ${anak.tanggalLahir ? new Date(anak.tanggalLahir).toLocaleDateString('id-ID') : 'N/A'}</p>
                    </div>
                    
                    <div class="notification-box">
                        <h3>📋 Detail Notifikasi</h3>
                        <p><strong>Deskripsi:</strong></p>
                        <p style="font-size: 16px; line-height: 1.8; margin: 15px 0; padding: 15px; background-color: white; border-radius: 6px; border-left: 4px solid #dc3545;">
                            ${notifikasi.deskripsi}
                        </p>
                        <p class="timestamp">
                            <strong>Waktu:</strong> ${formatDate(notifikasi.createdAt)}
                        </p>
                    </div>
                    
                    <div class="contact-info">
                        <h3>📞 Informasi Kontak Darurat</h3>
                        <p><strong>Daycare Candice Kids</strong></p>
                        <p>📧 Email: info@candicekids.com</p>
                        <p>☎️ Telepon: (021) 1234-5678</p>
                        <p>📱 WhatsApp: +62 812-3456-7890</p>
                        <p>📍 Alamat: Jl. Contoh No. 123, Jakarta</p>
                    </div>
                    
                    <p><strong>Tindakan yang disarankan:</strong></p>
                    <ul>
                        <li>Segera hubungi daycare untuk informasi lebih lanjut</li>
                        <li>Jika memerlukan tindakan medis, kami siap membantu koordinasi</li>
                        <li>Pastikan nomor telepon darurat Anda selalu aktif</li>
                    </ul>
                    
                    <p>Kami mengutamakan keselamatan dan kesejahteraan anak-anak. Jangan ragu untuk menghubungi kami jika ada pertanyaan atau kekhawatiran.</p>
                    
                    <center>
                        <a href="tel:+6281234567890" class="btn">📞 Hubungi Kami Sekarang</a>
                    </center>
                </div>
                
                <div class="footer">
                    <p><strong>Candice Kids Daycare</strong></p>
                    <p>Mengutamakan Keselamatan dan Kesejahteraan Anak</p>
                    <p class="timestamp">Email ini dikirim secara otomatis pada ${formatDate(new Date())}</p>
                    <p style="font-size: 12px; color: #6c757d;">
                        Email ini berisi informasi penting. Jika Anda memiliki pertanyaan, silakan hubungi kami langsung.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send general notification email
    async sendGeneralNotification(to, subject, message) {
        try {
            const mailOptions = {
                from: {
                    name: 'Candice Kids Daycare',
                    address: process.env.EMAIL_USER || 'noreply@candicekids.com'
                },
                to: to,
                subject: subject,
                html: this.generateGeneralEmailTemplate(subject, message)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('General notification sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Failed to send general notification:', error);
            throw new Error(`Failed to send general notification: ${error.message}`);
        }
    }

    // Generate general email template
    generateGeneralEmailTemplate(subject, message) {
        return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f8f9fa; }
                .footer { background-color: #6c757d; color: white; padding: 10px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Candice Kids Daycare</h1>
                </div>
                <div class="content">
                    <h2>${subject}</h2>
                    <p>${message}</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Candice Kids Daycare. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service is working correctly' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new EmailService();
