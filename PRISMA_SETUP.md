# Prisma Setup untuk Candice Kids

## 📋 Overview

Setup Prisma untuk sistem manajemen daycare Candice Kids dengan relasi lengkap antara semua tabel.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Buat file `.env` di root project:
```env
DATABASE_URL="mysql://username:password@localhost:3306/candice_kids"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema ke Database
```bash
npm run db:push
```

### 5. Seed Database dengan Sample Data
```bash
npm run db:seed
```

## 📊 Database Schema

### Models & Relations

#### User (Admin & Orang Tua)
- **Relations:**
  - `anakAsOrangTua` → Anak[] (One-to-Many)
  - `absensiCreated` → Absensi[] (One-to-Many)
  - `komunikasiAsPengirim` → Komunikasi[] (One-to-Many)
  - `komunikasiAsPenerima` → Komunikasi[] (One-to-Many)
  - `tagihan` → Tagihan[] (One-to-Many)
  - `pembayaranVerified` → Pembayaran[] (One-to-Many)
  - `notifikasiDaruratCreated` → NotifikasiDarurat[] (One-to-Many)

#### Pengasuh
- **Relations:**
  - `anakAnak` → Anak[] (One-to-Many)
  - `aktivitas` → Aktivitas[] (One-to-Many)

#### Anak
- **Relations:**
  - `orangTua` → User (Many-to-One)
  - `pengasuh` → Pengasuh (Many-to-One)
  - `absensi` → Absensi[] (One-to-Many)
  - `aktivitas` → Aktivitas[] (One-to-Many)
  - `komunikasi` → Komunikasi[] (One-to-Many)
  - `tagihan` → Tagihan[] (One-to-Many)
  - `notifikasiDarurat` → NotifikasiDarurat[] (One-to-Many)

#### Absensi
- **Relations:**
  - `anak` → Anak (Many-to-One)
  - `createdByUser` → User (Many-to-One)

#### Aktivitas
- **Relations:**
  - `anak` → Anak (Many-to-One)
  - `pengasuh` → Pengasuh (Many-to-One)

#### Komunikasi
- **Relations:**
  - `pengirim` → User (Many-to-One)
  - `penerima` → User (Many-to-One)
  - `anak` → Anak (Many-to-One)

#### Tagihan
- **Relations:**
  - `orangTua` → User (Many-to-One)
  - `anak` → Anak (Many-to-One)
  - `pembayaran` → Pembayaran[] (One-to-Many)

#### Pembayaran
- **Relations:**
  - `tagihan` → Tagihan (Many-to-One)
  - `verifiedByUser` → User (Many-to-One)

#### NotifikasiDarurat
- **Relations:**
  - `anak` → Anak (Many-to-One)
  - `createdByUser` → User (Many-to-One)

## 🛠️ Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## 📝 Usage Examples

### Basic CRUD Operations

```javascript
const prisma = require('./lib/prisma');

// Get all anak with their orang tua and pengasuh
const anak = await prisma.anak.findMany({
  include: {
    orangTua: true,
    pengasuh: true,
    absensi: {
      where: {
        tanggal: new Date()
      }
    }
  }
});

// Create new absensi
const absensi = await prisma.absensi.create({
  data: {
    anakId: 1,
    tanggal: new Date(),
    createdBy: 1
  }
});

// Get aktivitas with pengasuh info
const aktivitas = await prisma.aktivitas.findMany({
  include: {
    anak: true,
    pengasuh: true
  },
  where: {
    tanggal: new Date()
  }
});
```

### Complex Queries

```javascript
// Get dashboard data for admin
const dashboardData = await prisma.user.findMany({
  where: {
    role: 'orang_tua'
  },
  include: {
    anakAsOrangTua: {
      include: {
        pengasuh: true,
        absensi: {
          where: {
            tanggal: new Date()
          }
        },
        aktivitas: {
          where: {
            tanggal: new Date()
          },
          include: {
            pengasuh: true
          }
        }
      }
    }
  }
});

// Get tagihan with pembayaran info
const tagihanWithPembayaran = await prisma.tagihan.findMany({
  include: {
    orangTua: true,
    anak: true,
    pembayaran: {
      include: {
        verifiedByUser: true
      }
    }
  },
  where: {
    status: 'belum_bayar'
  }
});
```

## 🔧 Migration Commands

### Create Migration
```bash
npx prisma migrate dev --name init
```

### Reset Database
```bash
npx prisma migrate reset
```

### Deploy to Production
```bash
npx prisma migrate deploy
```

## 📊 Sample Data

Setelah menjalankan `npm run db:seed`, database akan berisi:

- **1 Admin user** (admin@candicekids.com)
- **2 Orang tua users** (ayah.aisyah@email.com, ibu.ahmad@email.com)
- **2 Pengasuh** (Bu Sari, Bu Nina)
- **2 Anak** (Aisyah, Ahmad)
- **Sample absensi** untuk hari ini
- **Sample aktivitas** untuk hari ini
- **Sample tagihan** untuk bulan Juli 2024
- **Sample komunikasi** antara admin dan orang tua

## 🔐 Authentication

Password default untuk semua user: `password`

## 📱 Features Supported

### Admin Features
- ✅ Dashboard
- ✅ Kelola Data Anak & Orang Tua
- ✅ Absensi Anak
- ✅ Aktivitas Harian
- ✅ Komunikasi ke Orang Tua
- ✅ Kelola Data Pengasuh
- ✅ Kelola Tagihan & Pembayaran

### Orang Tua Features
- ✅ Absen Anak
- ✅ Aktivitas Harian
- ✅ Chat Admin
- ✅ Tagihan & Pembayaran
- ✅ Notifikasi Darurat

## 🚨 Troubleshooting

### Common Issues

1. **Database connection error**
   - Pastikan MySQL server berjalan
   - Cek DATABASE_URL di file .env

2. **Prisma client not generated**
   - Jalankan `npm run db:generate`

3. **Migration conflicts**
   - Reset database: `npx prisma migrate reset`
   - Re-seed: `npm run db:seed`

4. **Foreign key constraint errors**
   - Pastikan data parent sudah ada sebelum insert child
   - Gunakan `include` untuk eager loading

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [MySQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/mysql) 