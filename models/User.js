const prisma = require('../lib/prisma');

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
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Create new user
    static async create(userData) {
        try {
            const user = await prisma.user.create({
                data: userData
            });
            return new User(user);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
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
                    pembayaranVerified: true,
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

    // Get user info without sensitive data
    toJSON() {
        const { password, ...userInfo } = this;
        return userInfo;
    }
}

module.exports = User;