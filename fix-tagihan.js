const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTagihanData() {
    try {
        console.log('🔍 Checking existing data...');

        // Check users
        const users = await prisma.user.findMany({
            include: {
                anakAsOrangTua: true
            }
        });
        
        console.log('👥 Users found:');
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Children: ${user.anakAsOrangTua.length}`);
        });

        // Check tagihan
        const existingTagihan = await prisma.tagihan.findMany({
            include: {
                orangTua: true,
                anak: true
            }
        });
        
        console.log('\n💰 Existing Tagihan:');
        existingTagihan.forEach(tagihan => {
            console.log(`- ID: ${tagihan.id}, OrangTua: ${tagihan.orangTuaId}, Anak: ${tagihan.anakId}, Amount: ${tagihan.jumlah}`);
        });

        // Find the correct orang tua user (ID 2)
        const orangTua = await prisma.user.findFirst({
            where: { 
                id: 2,
                role: 'orang_tua' 
            },
            include: {
                anakAsOrangTua: true
            }
        });

        if (!orangTua) {
            console.log('❌ OrangTua with ID 2 not found');
            return;
        }

        console.log(`\n✅ Found OrangTua: ${orangTua.nama} (${orangTua.email})`);
        console.log(`   Children: ${orangTua.anakAsOrangTua.length}`);

        // If no children, create one
        let anak;
        if (orangTua.anakAsOrangTua.length === 0) {
            console.log('📝 Creating child for this parent...');
            anak = await prisma.anak.create({
                data: {
                    nama: 'Andi Santoso',
                    tanggalLahir: new Date('2020-05-15'),
                    jenisKelamin: 'L',
                    alamat: 'Jl. Contoh No. 123, Jakarta',
                    orangTuaId: orangTua.id,
                    status: 'aktif'
                }
            });
            console.log(`✅ Created child: ${anak.nama} (ID: ${anak.id})`);
        } else {
            anak = orangTua.anakAsOrangTua[0];
            console.log(`✅ Using existing child: ${anak.nama} (ID: ${anak.id})`);
        }

        // Create tagihan for this orangTua and anak
        console.log('\n📋 Creating tagihan...');
        
        // Check if tagihan already exists
        const existingForUser = await prisma.tagihan.findFirst({
            where: {
                orangTuaId: orangTua.id,
                anakId: anak.id
            }
        });

        if (existingForUser) {
            console.log('ℹ️  Tagihan already exists for this user');
        } else {
            // Create new tagihan
            const tagihan1 = await prisma.tagihan.create({
                data: {
                    orangTuaId: orangTua.id,
                    anakId: anak.id,
                    periodeBulan: '2024-12',
                    jenisTagihan: 'bulanan',
                    jumlah: 1000000,
                    tanggalJatuhTempo: new Date('2024-12-01'),
                    status: 'belum_bayar',
                    deskripsi: 'Biaya penitipan anak bulan Desember 2024'
                }
            });

            const tagihan2 = await prisma.tagihan.create({
                data: {
                    orangTuaId: orangTua.id,
                    anakId: anak.id,
                    periodeBulan: '2025-01',
                    jenisTagihan: 'bulanan',
                    jumlah: 1000000,
                    tanggalJatuhTempo: new Date('2025-01-01'),
                    status: 'belum_bayar',
                    deskripsi: 'Biaya penitipan anak bulan Januari 2025'
                }
            });

            console.log(`✅ Created 2 tagihan for user ${orangTua.id}`);
            console.log(`   - Tagihan 1: ${tagihan1.id} (Dec 2024)`);
            console.log(`   - Tagihan 2: ${tagihan2.id} (Jan 2025)`);
        }

        // Verify data
        const finalTagihan = await prisma.tagihan.findMany({
            where: {
                orangTuaId: orangTua.id
            },
            include: {
                anak: true
            }
        });

        console.log(`\n🎉 Final result: ${finalTagihan.length} tagihan found for user ${orangTua.id}`);
        finalTagihan.forEach(t => {
            console.log(`   - ${t.periodeBulan}: Rp ${t.jumlah} for ${t.anak.nama}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixTagihanData();
