const prisma = require('../lib/prisma');

class Pengasuh {
    constructor(data) {
        this.id = data.id;
        this.nama = data.nama;
        this.email = data.email;
        this.telepon = data.telepon;
        this.alamat = data.alamat;
        this.tanggalLahir = data.tanggalLahir;
        this.jenisKelamin = data.jenisKelamin;
        this.pendidikan = data.pendidikan;
        this.pengalaman = data.pengalaman;
        this.foto = data.foto;
        this.tanggalBergabung = data.tanggalBergabung;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Create new pengasuh
    static async create(pengasuhData) {
        try {
            const pengasuh = await prisma.pengasuh.create({
                data: pengasuhData
            });
            return new Pengasuh(pengasuh);
        } catch (error) {
            throw new Error(`Error creating pengasuh: ${error.message}`);
        }
    }

    // Find pengasuh by ID
    static async findById(id) {
        try {
            const pengasuh = await prisma.pengasuh.findUnique({
                where: { id: parseInt(id) }
            });
            return pengasuh ? new Pengasuh(pengasuh) : null;
        } catch (error) {
            throw new Error(`Error finding pengasuh: ${error.message}`);
        }
    }

    // Find pengasuh by email
    static async findByEmail(email) {
        try {
            const pengasuh = await prisma.pengasuh.findUnique({
                where: { email }
            });
            return pengasuh ? new Pengasuh(pengasuh) : null;
        } catch (error) {
            throw new Error(`Error finding pengasuh by email: ${error.message}`);
        }
    }

    // Get all pengasuh
    static async findAll(options = {}) {
        try {
            const pengasuh = await prisma.pengasuh.findMany({
                where: options.where,
                include: options.include,
                orderBy: options.orderBy,
                skip: options.skip,
                take: options.take
            });
            return pengasuh.map(p => new Pengasuh(p));
        } catch (error) {
            throw new Error(`Error finding pengasuh: ${error.message}`);
        }
    }

    // Get active pengasuh
    static async findActive() {
        try {
            const pengasuh = await prisma.pengasuh.findMany({
                where: { status: 'aktif' },
                orderBy: { nama: 'asc' }
            });
            return pengasuh.map(p => new Pengasuh(p));
        } catch (error) {
            throw new Error(`Error finding active pengasuh: ${error.message}`);
        }
    }

    // Update pengasuh
    async update(updateData) {
        try {
            const updatedPengasuh = await prisma.pengasuh.update({
                where: { id: this.id },
                data: updateData
            });
            Object.assign(this, updatedPengasuh);
            return this;
        } catch (error) {
            throw new Error(`Error updating pengasuh: ${error.message}`);
        }
    }

    // Delete pengasuh
    async delete() {
        try {
            await prisma.pengasuh.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting pengasuh: ${error.message}`);
        }
    }

    // Get pengasuh's activities (currently returns empty array since no direct relationship)
    async getActivities(options = {}) {
        try {
            // Since there's no direct relationship between pengasuh and aktivitas,
            // we'll return an empty array for now
            // This would need to be implemented when pengasuh-anak relationship is added
            return [];
        } catch (error) {
            throw new Error(`Error getting pengasuh activities: ${error.message}`);
        }
    }

    // Get pengasuh's children (anak) - currently returns empty array since no direct relationship
    async getChildren() {
        try {
            // Since there's no direct relationship between pengasuh and anak,
            // we'll return an empty array for now
            // This would need to be implemented when pengasuh-anak relationship is added
            return [];
        } catch (error) {
            throw new Error(`Error getting pengasuh's children: ${error.message}`);
        }
    }

    // Get pengasuh's daily activities
    async getDailyActivities(date = new Date()) {
        try {
            // Since there's no direct relationship between pengasuh and aktivitas,
            // we'll return an empty array for now
            return [];
        } catch (error) {
            throw new Error(`Error getting daily activities: ${error.message}`);
        }
    }

    // Get pengasuh's attendance records
    async getAttendanceRecords(date = new Date()) {
        try {
            // Since there's no direct relationship between pengasuh and anak,
            // we'll return an empty array for now
            return [];
        } catch (error) {
            throw new Error(`Error getting attendance records: ${error.message}`);
        }
    }

    // Check if pengasuh is active
    isActive() {
        return this.status === 'aktif';
    }

    // Get pengasuh's experience in years
    getExperienceYears() {
        if (!this.tanggalBergabung) return 0;
        const now = new Date();
        const joinDate = new Date(this.tanggalBergabung);
        const diffTime = Math.abs(now - joinDate);
        const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
        return diffYears;
    }

    // Get pengasuh's age
    getAge() {
        if (!this.tanggalLahir) return null;
        const today = new Date();
        const birthDate = new Date(this.tanggalLahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Get pengasuh info for display
    toJSON() {
        return {
            id: this.id,
            nama: this.nama,
            email: this.email,
            telepon: this.telepon,
            alamat: this.alamat,
            tanggalLahir: this.tanggalLahir,
            jenisKelamin: this.jenisKelamin,
            pendidikan: this.pendidikan,
            pengalaman: this.pengalaman,
            foto: this.foto,
            tanggalBergabung: this.tanggalBergabung,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            experienceYears: this.getExperienceYears(),
            age: this.getAge()
        };
    }
}

module.exports = Pengasuh;