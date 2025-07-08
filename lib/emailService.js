const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Send email verification
    async sendVerificationEmail(user, verificationUrl) {
        try {
            const mailOptions = {
                from: `"Candice Kids" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Verifikasi Email - Candice Kids',
                html: this.getVerificationEmailTemplate(user, verificationUrl)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(user, resetUrl) {
        try {
            const mailOptions = {
                from: `"Candice Kids" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Reset Password - Candice Kids',
                html: this.getPasswordResetEmailTemplate(user, resetUrl)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    // Send welcome email
    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: `"Candice Kids" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: 'Selamat Datang di Candice Kids',
                html: this.getWelcomeEmailTemplate(user)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw new Error('Failed to send welcome email');
        }
    }

    // Send emergency notification email
    async sendEmergencyNotificationEmail(user, anak, notifikasi) {
        try {
            const mailOptions = {
                from: `"Candice Kids" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: `Notifikasi Darurat untuk ${anak.nama} - Candice Kids`,
                html: this.getEmergencyNotificationTemplate(user, anak, notifikasi)
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Emergency notification email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending emergency notification email:', error);
            throw new Error('Failed to send emergency notification email');
        }
    }

    // Email verification template
    getVerificationEmailTemplate(user, verificationUrl) {
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verifikasi Email - Candice Kids</title>
                <style>
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        line-height: 1.6;
                        color: #2C3E50;
                        background-color: #F8F9FF;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #91edf9 0%, #fcf8d2 100%);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background-color: #ffffff;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: #91edf9;
                        font-weight: bold;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2C3E50;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .message {
                        font-size: 16px;
                        color: #7F8C8D;
                        margin-bottom: 30px;
                        text-align: center;
                        line-height: 1.8;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #91edf9 0%, #f4e55e 100%);
                        color: #2C3E50;
                        text-decoration: none;
                        padding: 15px 40px;
                        border-radius: 50px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(145, 237, 249, 0.3);
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(145, 237, 249, 0.4);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #7F8C8D;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                        color: #856404;
                    }
                    .link {
                        color: #91edf9;
                        text-decoration: none;
                    }
                    .link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">CK</div>
                        <h1 style="margin: 0; color: #2C3E50; font-size: 24px;">Candice Kids</h1>
                        <p style="margin: 10px 0 0; color: #7F8C8D;">Daycare Terpercaya</p>
                    </div>
                    
                    <div class="content">
                        <h2 class="title">Verifikasi Email Anda</h2>
                        <p class="message">
                            Halo <strong>${user.nama}</strong>,<br><br>
                            Terima kasih telah mendaftar di Candice Kids! Untuk menyelesaikan proses pendaftaran, 
                            silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">
                                Verifikasi Email
                            </a>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Penting:</strong><br>
                            Link verifikasi ini akan kadaluarsa dalam 24 jam. 
                            Jika Anda tidak mendaftar di Candice Kids, abaikan email ini.
                        </div>
                        
                        <p style="text-align: center; color: #7F8C8D; font-size: 14px;">
                            Jika tombol tidak berfungsi, copy dan paste link berikut ke browser Anda:<br>
                            <a href="${verificationUrl}" class="link">${verificationUrl}</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Candice Kids. Semua hak dilindungi.</p>
                        <p>Jika Anda memiliki pertanyaan, hubungi kami di <a href="mailto:support@candicekids.com" class="link">support@candicekids.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Password reset email template
    getPasswordResetEmailTemplate(user, resetUrl) {
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password - Candice Kids</title>
                <style>
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        line-height: 1.6;
                        color: #2C3E50;
                        background-color: #F8F9FF;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #91edf9 0%, #fcf8d2 100%);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background-color: #ffffff;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: #91edf9;
                        font-weight: bold;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2C3E50;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .message {
                        font-size: 16px;
                        color: #7F8C8D;
                        margin-bottom: 30px;
                        text-align: center;
                        line-height: 1.8;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #91edf9 0%, #f4e55e 100%);
                        color: #2C3E50;
                        text-decoration: none;
                        padding: 15px 40px;
                        border-radius: 50px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(145, 237, 249, 0.3);
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(145, 237, 249, 0.4);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #7F8C8D;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                        color: #856404;
                    }
                    .link {
                        color: #91edf9;
                        text-decoration: none;
                    }
                    .link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">CK</div>
                        <h1 style="margin: 0; color: #2C3E50; font-size: 24px;">Candice Kids</h1>
                        <p style="margin: 10px 0 0; color: #7F8C8D;">Daycare Terpercaya</p>
                    </div>
                    
                    <div class="content">
                        <h2 class="title">Reset Password</h2>
                        <p class="message">
                            Halo <strong>${user.nama}</strong>,<br><br>
                            Kami menerima permintaan untuk mereset password akun Anda. 
                            Klik tombol di bawah untuk membuat password baru.
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">
                                Reset Password
                            </a>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Penting:</strong><br>
                            Link reset password ini akan kadaluarsa dalam 1 jam. 
                            Jika Anda tidak meminta reset password, abaikan email ini.
                        </div>
                        
                        <p style="text-align: center; color: #7F8C8D; font-size: 14px;">
                            Jika tombol tidak berfungsi, copy dan paste link berikut ke browser Anda:<br>
                            <a href="${resetUrl}" class="link">${resetUrl}</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Candice Kids. Semua hak dilindungi.</p>
                        <p>Jika Anda memiliki pertanyaan, hubungi kami di <a href="mailto:support@candicekids.com" class="link">support@candicekids.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Welcome email template
    getWelcomeEmailTemplate(user) {
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Selamat Datang - Candice Kids</title>
                <style>
                    body {
                        font-family: 'Poppins', Arial, sans-serif;
                        line-height: 1.6;
                        color: #2C3E50;
                        background-color: #F8F9FF;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #91edf9 0%, #fcf8d2 100%);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        background-color: #ffffff;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: #91edf9;
                        font-weight: bold;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2C3E50;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .message {
                        font-size: 16px;
                        color: #7F8C8D;
                        margin-bottom: 30px;
                        text-align: center;
                        line-height: 1.8;
                    }
                    .features {
                        background-color: #f8f9fa;
                        border-radius: 15px;
                        padding: 30px;
                        margin: 30px 0;
                    }
                    .feature {
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .feature-icon {
                        width: 40px;
                        height: 40px;
                        background-color: #91edf9;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        color: white;
                        font-size: 18px;
                    }
                    .feature-text {
                        color: #2C3E50;
                        font-weight: 500;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #91edf9 0%, #f4e55e 100%);
                        color: #2C3E50;
                        text-decoration: none;
                        padding: 15px 40px;
                        border-radius: 50px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(145, 237, 249, 0.3);
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(145, 237, 249, 0.4);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 30px;
                        text-align: center;
                        font-size: 14px;
                        color: #7F8C8D;
                    }
                    .link {
                        color: #91edf9;
                        text-decoration: none;
                    }
                    .link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">CK</div>
                        <h1 style="margin: 0; color: #2C3E50; font-size: 24px;">Candice Kids</h1>
                        <p style="margin: 10px 0 0; color: #7F8C8D;">Daycare Terpercaya</p>
                    </div>
                    
                    <div class="content">
                        <h2 class="title">Selamat Datang di Candice Kids!</h2>
                        <p class="message">
                            Halo <strong>${user.nama}</strong>,<br><br>
                            Selamat! Akun Anda telah berhasil diverifikasi dan sekarang aktif. 
                            Anda dapat mulai menggunakan semua fitur Candice Kids untuk memantau perkembangan anak Anda.
                        </p>
                        
                        <div class="features">
                            <h3 style="color: #2C3E50; margin-bottom: 20px;">Fitur Unggulan Kami:</h3>
                            <div class="feature">
                                <div class="feature-icon">📊</div>
                                <div class="feature-text">Absensi Real-time</div>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">📝</div>
                                <div class="feature-text">Aktivitas Harian</div>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">💬</div>
                                <div class="feature-text">Komunikasi Mudah</div>
                            </div>
                            <div class="feature">
                                <div class="feature-icon">💳</div>
                                <div class="feature-text">Pembayaran Digital</div>
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/login" class="button">
                                Mulai Sekarang
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Candice Kids. Semua hak dilindungi.</p>
                        <p>Jika Anda memiliki pertanyaan, hubungi kami di <a href="mailto:support@candicekids.com" class="link">support@candicekids.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Emergency notification email template
    getEmergencyNotificationTemplate(user, anak, notifikasi) {
        return `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Notifikasi Darurat - Candice Kids</title>
                <style>
                    body { font-family: 'Poppins', Arial, sans-serif; background: #f8f9ff; color: #2C3E50; }
                    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #ffb347 0%, #ffcc80 100%); padding: 32px 24px; text-align: center; }
                    .header h1 { margin: 0; color: #d35400; font-size: 24px; }
                    .content { padding: 32px 24px; }
                    .title { font-size: 22px; font-weight: bold; color: #d35400; margin-bottom: 16px; }
                    .message { font-size: 16px; color: #2C3E50; margin-bottom: 24px; }
                    .box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin-bottom: 24px; color: #856404; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #7F8C8D; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Notifikasi Darurat</h1>
                    </div>
                    <div class="content">
                        <div class="title">${anak.nama} (${user.nama})</div>
                        <div class="message">
                            Kami ingin memberitahukan bahwa telah terjadi situasi darurat terkait anak Anda di Candice Kids.<br><br>
                            <div class="box">
                                <strong>Deskripsi Darurat:</strong><br>
                                ${notifikasi.deskripsi}
                            </div>
                            <strong>Waktu Notifikasi:</strong> ${new Date(notifikasi.createdAt).toLocaleString('id-ID')}
                        </div>
                        <p>Segera hubungi admin atau pihak daycare untuk informasi lebih lanjut.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Candice Kids. Semua hak dilindungi.</p>
                        <p>Jika Anda memiliki pertanyaan, hubungi kami di <a href="mailto:support@candicekids.com">support@candicekids.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Test email service
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service error:', error);
            return false;
        }
    }
}

module.exports = new EmailService();