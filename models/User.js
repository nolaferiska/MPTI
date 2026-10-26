    
const prisma = require('../lib/prisma');
const crypto = require('crypto');

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        this.nama = data.nama;
        this.telepon = data.telepon;
        this.alamat = data.alamat;
        this.foto = data.foto;
        this.status = data.status;
        this.emailVerified = data.emailVerified;
        this.emailVerificationToken = data.emailVerificationToken;
        this.emailVerificationExpires = data.emailVerificationExpires;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Create new user with email verification
    static async create(userData) {
        try {
            // Generate email verification token
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    emailVerified: false,
                    emailVerificationToken,
                    emailVerificationExpires,
                    status: 'pending' // Set status to pending until email is verified
                }
            });
            return new User(user);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Verify email with token
    static async verifyEmail(token) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    emailVerificationToken: token,
                    emailVerificationExpires: {
                        gt: new Date()
                    },
                    emailVerified: false
                }
            });

            if (!user) {
                throw new Error('Invalid or expired verification token');
            }

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpires: null,
                    status: 'aktif'
                }
            });

            return new User(updatedUser);
        } catch (error) {
            throw new Error(`Error verifying email: ${error.message}`);
        }
    }

    // Generate password reset token
    async generatePasswordResetToken() {
        const crypto = require('crypto');
        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
        const updatedUser = await prisma.user.update({
            where: { id: this.id },
            data: {
                passwordResetToken,
                passwordResetExpires
            }
        });
        Object.assign(this, updatedUser);
        return passwordResetToken;
    }

    // Find user by password reset token
    static async findByPasswordResetToken(token) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: {
                        gt: new Date()
                    }
                }
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by password reset token: ${error.message}`);
        }
    }

    // Update password and clear reset token
    async resetPassword(newPassword) {
        try {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            const updatedUser = await prisma.user.update({
                where: { id: this.id },
                data: {
                    password: hashedPassword,
                    passwordResetToken: null,
                    passwordResetExpires: null
                }
            });
            Object.assign(this, updatedUser);
            return this;
        } catch (error) {
            throw new Error(`Error resetting password: ${error.message}`);
        }
    }
    // Resend verification email
    async resendVerificationEmail() {
        try {
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const updatedUser = await prisma.user.update({
                where: { id: this.id },
                data: {
                    emailVerificationToken,
                    emailVerificationExpires
                }
            });

            Object.assign(this, updatedUser);
            return this;
        } catch (error) {
            throw new Error(`Error resending verification email: ${error.message}`);
        }
    }

    // Find user by verification token
    static async findByVerificationToken(token) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    emailVerificationToken: token,
                    emailVerificationExpires: {
                        gt: new Date()
                    }
                }
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by verification token: ${error.message}`);
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                include: {
                    anakAsOrangTua: true,
                    absensiCreated: true,
                    komunikasiAsPengirim: true,
                    komunikasiAsPenerima: true,
                    tagihan: true,
                    notifikasiDaruratCreated: true
                }
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    // Find user by username
    static async findByUsername(username) {
        try {
            const user = await prisma.user.findUnique({
                where: { username }
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw new Error(`Error finding user by username: ${error.message}`);
        }
    }

    // Get all users
    static async findAll(options = {}) {
        try {
            const users = await prisma.user.findMany({
                where: options.where,
                include: options.include,
                orderBy: options.orderBy,
                skip: options.skip,
                take: options.take
            });
            return users.map(user => new User(user));
        } catch (error) {
            throw new Error(`Error finding users: ${error.message}`);
        }
    }

    // Get users by role
    static async findByRole(role) {
        try {
            const users = await prisma.user.findMany({
                where: { role },
                include: {
                    anakAsOrangTua: true
                }
            });
            return users.map(user => new User(user));
        } catch (error) {
            throw new Error(`Error finding users by role: ${error.message}`);
        }
    }

    // Update user
    async update(updateData) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: this.id },
                data: updateData
            });
            Object.assign(this, updatedUser);
            return this;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    async delete() {
        try {
            await prisma.user.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get user's children (anak)
    async getChildren() {
        try {
            const children = await prisma.anak.findMany({
                where: { orangTuaId: this.id },
                include: {
                    absensi: true,
                    aktivitas: true
                }
            });
            return children;
        } catch (error) {
            throw new Error(`Error getting user's children: ${error.message}`);
        }
    }

    // Get user's attendance records (if admin)
    async getAttendanceRecords() {
        try {
            const attendance = await prisma.absensi.findMany({
                where: { createdBy: this.id },
                include: {
                    anak: true
                }
            });
            return attendance;
        } catch (error) {
            throw new Error(`Error getting attendance records: ${error.message}`);
        }
    }

    // Get user's communications
    async getCommunications() {
        try {
            const communications = await prisma.komunikasi.findMany({
                where: {
                    OR: [
                        { pengirimId: this.id },
                        { penerimaId: this.id }
                    ]
                },
                include: {
                    pengirim: true,
                    penerima: true,
                    anak: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return communications;
        } catch (error) {
            throw new Error(`Error getting communications: ${error.message}`);
        }
    }

    // Get user's bills
    async getBills() {
        try {
            const bills = await prisma.tagihan.findMany({
                where: { orangTuaId: this.id },
                include: {
                    anak: true,
                    pembayaran: true
                }
            });
            return bills;
        } catch (error) {
            throw new Error(`Error getting bills: ${error.message}`);
        }
    }

    // Check if user is admin
    isAdmin() {
        return this.role === 'admin';
    }

    // Check if user is orang tua
    isOrangTua() {
        return this.role === 'orang_tua';
    }

    // Check if user is active
    isActive() {
        return this.status === 'aktif';
    }

    // Check if email is verified
    isEmailVerified() {
        return this.emailVerified === true;
    }

    // Check if user can login (active and email verified)
    canLogin() {
        return this.isActive() && this.isEmailVerified();
    }

    // Get user info without sensitive data
    toJSON() {
        const { password, emailVerificationToken, ...userInfo } = this;
        return userInfo;
    }

    // Send emergency notification to this user
    async sendEmergencyNotification(anak, notifikasi) {
        const emailService = require('../lib/emailService');
        return emailService.sendEmergencyNotificationEmail(this, anak, notifikasi);
    }
}

module.exports = User;