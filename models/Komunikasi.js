const prisma = require('../lib/prisma');

class Komunikasi {
    constructor(data) {
        this.id = data.id;
        this.pengirimId = data.pengirimId;
        this.penerimaId = data.penerimaId;
        this.pesan = data.pesan;
        this.createdAt = data.createdAt;
        // Include relations if available
        this.pengirim = data.pengirim;
        this.penerima = data.penerima;
    }

    // Create new komunikasi
    static async create(komunikasiData) {
        try {
            const komunikasi = await prisma.komunikasi.create({
                data: komunikasiData,
                include: {
                    pengirim: true,
                    penerima: true
                }
            });
            return new Komunikasi(komunikasi);
        } catch (error) {
            throw new Error(`Error creating komunikasi: ${error.message}`);
        }
    }

    // Find komunikasi by ID
    static async findById(id) {
        try {
            const komunikasi = await prisma.komunikasi.findUnique({
                where: { id: parseInt(id) },
                include: {
                    pengirim: true,
                    penerima: true
                }
            });
            return komunikasi ? new Komunikasi(komunikasi) : null;
        } catch (error) {
            throw new Error(`Error finding komunikasi: ${error.message}`);
        }
    }

    // Get all komunikasi
    static async findAll(options = {}) {
        try {
            const komunikasi = await prisma.komunikasi.findMany({
                where: options.where,
                include: options.include || {
                    pengirim: true,
                    penerima: true
                },
                orderBy: options.orderBy || {
                    createdAt: 'desc'
                },
                skip: options.skip,
                take: options.take
            });
            return komunikasi.map(k => new Komunikasi(k));
        } catch (error) {
            throw new Error(`Error finding komunikasi: ${error.message}`);
        }
    }

    // Get komunikasi by user (as sender or receiver)
    static async findByUser(userId, options = {}) {
        try {
            const komunikasi = await prisma.komunikasi.findMany({
                where: {
                    OR: [
                        { pengirimId: parseInt(userId) },
                        { penerimaId: parseInt(userId) }
                    ],
                    ...options.where
                },
                include: {
                    pengirim: true,
                    penerima: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return komunikasi.map(k => new Komunikasi(k));
        } catch (error) {
            throw new Error(`Error finding komunikasi by user: ${error.message}`);
        }
    }

    // Get komunikasi between two users
    static async findByUsers(user1Id, user2Id, options = {}) {
        try {
            const komunikasi = await prisma.komunikasi.findMany({
                where: {
                    OR: [{
                            pengirimId: parseInt(user1Id),
                            penerimaId: parseInt(user2Id)
                        },
                        {
                            pengirimId: parseInt(user2Id),
                            penerimaId: parseInt(user1Id)
                        }
                    ],
                    ...options.where
                },
                include: {
                    pengirim: true,
                    penerima: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            return komunikasi.map(k => new Komunikasi(k));
        } catch (error) {
            throw new Error(`Error finding komunikasi between users: ${error.message}`);
        }
    }

    // Get recent komunikasi
    static async findRecent(limit = 20) {
        try {
            const komunikasi = await prisma.komunikasi.findMany({
                include: {
                    pengirim: true,
                    penerima: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
            return komunikasi.map(k => new Komunikasi(k));
        } catch (error) {
            throw new Error(`Error finding recent komunikasi: ${error.message}`);
        }
    }

    // Update komunikasi
    async update(updateData) {
        try {
            const updatedKomunikasi = await prisma.komunikasi.update({
                where: { id: this.id },
                data: updateData,
                include: {
                    pengirim: true,
                    penerima: true
                }
            });
            Object.assign(this, updatedKomunikasi);
            return this;
        } catch (error) {
            throw new Error(`Error updating komunikasi: ${error.message}`);
        }
    }

    // Delete komunikasi
    async delete() {
        try {
            await prisma.komunikasi.delete({
                where: { id: this.id }
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting komunikasi: ${error.message}`);
        }
    }

    // Get komunikasi statistics
    static async getStats() {
        try {
            const komunikasi = await prisma.komunikasi.findMany();

            const stats = {
                total: komunikasi.length
            };

            return stats;
        } catch (error) {
            throw new Error(`Error getting komunikasi stats: ${error.message}`);
        }
    }

    // Get komunikasi info for display
    toJSON() {
        return {
            id: this.id,
            pengirimId: this.pengirimId,
            penerimaId: this.penerimaId,
            pesan: this.pesan,
            createdAt: this.createdAt,
            pengirim: this.pengirim,
            penerima: this.penerima
        };
    }
}

module.exports = Komunikasi;