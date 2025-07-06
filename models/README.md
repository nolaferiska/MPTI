# Models Documentation

This directory contains all the model classes for the Candice Kids Daycare Management System. These models provide an abstraction layer over the Prisma ORM and include business logic methods.

## Available Models

### 1. User
Represents admin users and orang tua (parents).

**Key Features:**
- User authentication and authorization
- Role-based access control (admin/orang_tua)
- Children management for orang tua
- Communication handling

**Usage:**
```javascript
const { User } = require('../models');

// Create new user
const user = await User.create({
    email: 'user@example.com',
    password: 'hashedPassword',
    role: 'orang_tua',
    nama: 'John Doe'
});

// Find user by email
const user = await User.findByEmail('user@example.com');

// Get user's children
const children = await user.getChildren();
```

### 2. Pengasuh
Represents daycare caregivers/teachers.

**Key Features:**
- Caregiver profile management
- Experience tracking
- Children assignment
- Activity management

**Usage:**
```javascript
const { Pengasuh } = require('../models');

// Create new pengasuh
const pengasuh = await Pengasuh.create({
    nama: 'Bu Sari',
    email: 'sari@daycare.com',
    pendidikan: 'S1 Pendidikan Anak'
});

// Get active pengasuh
const activePengasuh = await Pengasuh.findActive();

// Get pengasuh's children
const children = await pengasuh.getChildren();
```

### 3. Anak
Represents children enrolled in the daycare.

**Key Features:**
- Child profile management
- Age calculation
- Enrollment tracking
- Health information

**Usage:**
```javascript
const { Anak } = require('../models');

// Create new anak
const anak = await Anak.create({
    nama: 'Aisyah',
    tanggalLahir: new Date('2019-05-10'),
    jenisKelamin: 'P',
    orangTuaId: 1
});

// Get anak by orang tua
const children = await Anak.findByOrangTua(orangTuaId);

// Get anak's age
const age = anak.getAge();
```

### 4. Absensi
Represents daily attendance records.

**Key Features:**
- Daily attendance tracking
- Check-in/check-out functionality
- Attendance statistics
- Temperature monitoring

**Usage:**
```javascript
const { Absensi } = require('../models');

// Create attendance record
const absensi = await Absensi.create({
    anakId: 1,
    tanggal: new Date(),
    status: 'hadir',
    suhuTubuh: 36.5
});

// Check in
await absensi.checkIn(new Date(), 36.5);

// Check out
await absensi.checkOut(new Date());

// Get today's attendance
const todayAttendance = await Absensi.findToday();
```

### 5. Aktivitas
Represents daily activities for children.

**Key Features:**
- Activity tracking with time
- Media attachments (photos/videos)
- Activity categorization
- Duration calculation

**Usage:**
```javascript
const { Aktivitas } = require('../models');

// Create activity
const aktivitas = await Aktivitas.create({
    anakId: 1,
    tanggal: new Date(),
    jenisAktivitas: 'bermain',
    deskripsi: 'Bermain puzzle',
    waktuMulai: new Date(),
    waktuSelesai: new Date()
});

// Get today's activities
const todayActivities = await Aktivitas.findToday();

// Get activities by type
const learningActivities = await Aktivitas.findByJenis('belajar');
```

### 6. Komunikasi
Represents communication between users.

**Key Features:**
- Chat functionality
- Notifications
- Announcements
- File attachments

**Usage:**
```javascript
const { Komunikasi } = require('../models');

// Send message
const komunikasi = await Komunikasi.create({
    pengirimId: 1,
    penerimaId: 2,
    pesan: 'Hello!',
    jenis: 'chat'
});

// Get user's communications
const messages = await Komunikasi.findByUser(userId);

// Mark as read
await komunikasi.markAsRead();
```

### 7. Tagihan
Represents billing and invoices.

**Key Features:**
- Invoice management
- Payment tracking
- Due date monitoring
- Payment percentage calculation

**Usage:**
```javascript
const { Tagihan } = require('../models');

// Create invoice
const tagihan = await Tagihan.create({
    orangTuaId: 1,
    anakId: 1,
    periodeBulan: '2024-07',
    jenisTagihan: 'bulanan',
    jumlah: 1500000
});

// Get overdue invoices
const overdue = await Tagihan.findOverdue();

// Get payment percentage
const percentage = await tagihan.getPaymentPercentage();
```

### 8. Pembayaran
Represents payment records.

**Key Features:**
- Payment processing
- Payment verification
- Multiple payment methods
- Proof of payment

**Usage:**
```javascript
const { Pembayaran } = require('../models');

// Create payment
const pembayaran = await Pembayaran.create({
    tagihanId: 1,
    jumlahBayar: 1500000,
    metodePembayaran: 'transfer',
    buktiPembayaran: 'proof.jpg'
});

// Verify payment
await pembayaran.verify(adminId);

// Get pending payments
const pending = await Pembayaran.findPending();
```

### 9. NotifikasiDarurat
Represents emergency notifications.

**Key Features:**
- Emergency alert system
- Status tracking
- Urgency levels
- Action tracking

**Usage:**
```javascript
const { NotifikasiDarurat } = require('../models');

// Create emergency notification
const notifikasi = await NotifikasiDarurat.create({
    anakId: 1,
    jenisDarurat: 'kesehatan',
    deskripsi: 'Anak demam tinggi',
    createdBy: 1
});

// Mark as handled
await notifikasi.markAsHandled('Diberikan obat penurun demam');

// Get active emergencies
const active = await NotifikasiDarurat.findActive();
```

## Common Patterns

### Error Handling
All model methods include proper error handling:
```javascript
try {
    const user = await User.findById(1);
    if (!user) {
        throw new Error('User not found');
    }
} catch (error) {
    console.error('Error:', error.message);
}
```

### Data Validation
Models include validation methods:
```javascript
// Check user roles
if (user.isAdmin()) {
    // Admin functionality
}

// Check status
if (pembayaran.isPending()) {
    // Handle pending payment
}
```

### Statistics and Reporting
Models provide statistical methods:
```javascript
// Get attendance stats
const stats = await Absensi.getStats(startDate, endDate);

// Get payment stats
const paymentStats = await Pembayaran.getStats();

// Get daily summary
const summary = await Aktivitas.getDailySummary();
```

## Importing Models

You can import individual models or all models at once:

```javascript
// Import individual model
const { User } = require('../models');

// Import all models
const models = require('../models');
const { User, Anak, Absensi } = models;
```

## Best Practices

1. **Always use try-catch blocks** when calling model methods
2. **Check for null returns** when using findById methods
3. **Use the toJSON() method** when sending data to frontend
4. **Leverage the built-in statistics methods** for reporting
5. **Use the display methods** (getJenisDisplay, getStatusDisplay) for UI consistency

## Database Relationships

The models maintain proper relationships as defined in the Prisma schema:

- **User** ↔ **Anak** (One-to-Many)
- **Pengasuh** ↔ **Anak** (One-to-Many)
- **Anak** ↔ **Absensi** (One-to-Many)
- **Anak** ↔ **Aktivitas** (One-to-Many)
- **User** ↔ **Komunikasi** (Many-to-Many)
- **Anak** ↔ **Tagihan** (One-to-Many)
- **Tagihan** ↔ **Pembayaran** (One-to-Many)
- **Anak** ↔ **NotifikasiDarurat** (One-to-Many)

Each model includes methods to access related data efficiently. 