const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('123', 10);
    const userPassword = await bcrypt.hash('123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@gmail.com',
            password: adminPassword,
            role: 'admin',
            nama: 'Administrator',
            telepon: '081234567890',
            alamat: 'Jl. Admin No. 1, Jakarta',
            status: 'aktif'
        }
    });

    // Create test orang tua users
    const user1 = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: userPassword,
            role: 'orang_tua',
            nama: 'Siti Aminah',
            telepon: '081234567891',
            alamat: 'Jl. Orang Tua No. 1, Jakarta',
            status: 'aktif'
        }
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'budi.santoso@example.com' },
        update: {},
        create: {
            email: 'budi.santoso@example.com',
            password: userPassword,
            role: 'orang_tua',
            nama: 'Budi Santoso',
            telepon: '081234567892',
            alamat: 'Jl. Orang Tua No. 2, Jakarta',
            status: 'aktif'
        }
    });

    // Create test pengasuh
    const pengasuh1 = await prisma.pengasuh.upsert({
        where: { email: 'sari.pengasuh@example.com' },
        update: {},
        create: {
            nama: 'Sari Pengasuh',
            email: 'sari.pengasuh@example.com',
            telepon: '081234567893',
            alamat: 'Jl. Pengasuh No. 1, Jakarta',
            tanggalLahir: new Date('1990-05-15'),
            jenisKelamin: 'P',
            pendidikan: 'S1 Pendidikan Anak Usia Dini',
            pengalaman: '5 tahun pengalaman mengajar PAUD',
            tanggalBergabung: new Date('2020-01-15'),
            status: 'aktif'
        }
    });

    // Create test anak
    const anak1 = await prisma.anak.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nama: 'Aisyah Putri Santoso',
            tanggalLahir: new Date('2019-03-10'),
            jenisKelamin: 'P',
            alamat: 'Jl. Anak No. 1, Jakarta',
            teleponDarurat: '081234567894',
            kondisiKesehatan: 'Sehat, tidak ada alergi',
            alergi: 'Tidak ada',
            orangTuaId: user1.id,
            tanggalMasuk: new Date('2023-01-15'),
            status: 'aktif'
        }
    });

    const anak2 = await prisma.anak.upsert({
        where: { id: 2 },
        update: {},
        create: {
            nama: 'Ahmad Rizki Indah',
            tanggalLahir: new Date('2018-07-22'),
            jenisKelamin: 'L',
            alamat: 'Jl. Anak No. 2, Jakarta',
            teleponDarurat: '081234567895',
            kondisiKesehatan: 'Sehat, tidak ada alergi',
            alergi: 'Tidak ada',
            orangTuaId: user2.id,
            tanggalMasuk: new Date('2023-02-01'),
            status: 'aktif'
        }
    });

}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });