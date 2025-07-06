const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🌱 Seeding database...');

        // Create admin user
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@candicekids.com' },
            update: {},
            create: {
                email: 'admin@candicekids.com',
                password: hashedAdminPassword,
                nama: 'Admin Candice Kids',
                role: 'admin',
                telepon: '081234567890'
            }
        });

        // Create orang tua user
        const hashedOrangTuaPassword = await bcrypt.hash('orangtua123', 10);
        const orangTua = await prisma.user.upsert({
            where: { email: 'orangtua@example.com' },
            update: {},
            create: {
                email: 'orangtua@example.com',
                password: hashedOrangTuaPassword,
                nama: 'Budi Santoso',
                role: 'orang_tua',
                telepon: '081234567891',
                alamat: 'Jl. Contoh No. 123, Jakarta'
            }
        });

        // Create pengasuh
        const pengasuh = await prisma.pengasuh.create({
            data: {
                nama: 'Siti Nurhaliza',
                email: 'siti@candicekids.com',
                telepon: '081234567892',
                alamat: 'Jl. Pengasuh No. 456, Jakarta',
                tanggalBergabung: new Date('2024-01-01'),
                status: 'aktif'
            }
        });

        // Create anak
        const anak = await prisma.anak.create({
            data: {
                nama: 'Andi Santoso',
                tanggalLahir: new Date('2020-05-15'),
                jenisKelamin: 'L',
                alamat: 'Jl. Contoh No. 123, Jakarta',
                orangTuaId: orangTua.id,
                status: 'aktif'
            }
        });

        // Create tagihan for December 2024 and January 2025
        const tagihan1 = await prisma.tagihan.create({
            data: {
                orangTuaId: orangTua.id,
                anakId: anak.id,
                periodeBulan: '2024-12',
                jumlah: 1000000,
                tanggalJatuhTempo: new Date('2024-12-01'),
                status: 'belum_bayar'
            }
        });

        const tagihan2 = await prisma.tagihan.create({
            data: {
                orangTuaId: orangTua.id,
                anakId: anak.id,
                periodeBulan: '2025-01',
                jumlah: 1000000,
                tanggalJatuhTempo: new Date('2025-01-01'),
                status: 'belum_bayar'
            }
        });

        console.log('✅ Database seeded successfully!');
        console.log('👤 Admin credentials: admin@candicekids.com / admin123');
        console.log('👨‍👩‍👧‍👦 Orang Tua credentials: orangtua@example.com / orangtua123');
        console.log('📊 Created test data for payment flow');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
