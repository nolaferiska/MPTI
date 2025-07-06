# Candice Kids - Daycare Management System

**Slogan: "Cerdas Mandiri Ceria"**

Sistem manajemen daycare modern yang memudahkan komunikasi antara admin, pengasuh, dan orang tua untuk memantau perkembangan anak.

## 🚀 Fitur Utama

### 👨‍💼 Admin Panel
- **Dashboard**: Overview data anak, absensi, dan aktivitas
- **Kelola Data Anak & Orang Tua**: CRUD data lengkap
- **Absensi Anak**: Tracking kehadiran real-time
- **Aktivitas Harian**: Upload foto/video kegiatan anak
- **Komunikasi**: Chat dengan orang tua
- **Kelola Pengasuh**: Manajemen staff pengasuh
- **Tagihan & Pembayaran**: Sistem billing terintegrasi

### 👨‍👩‍👧‍👦 Portal Orang Tua
- **Dashboard**: Info ringkas anak
- **Absen Anak**: Lihat status kehadiran
- **Aktivitas Harian**: Foto dan video kegiatan
- **Chat Admin**: Komunikasi langsung
- **Tagihan & Pembayaran**: Status billing
- **Notifikasi Darurat**: Alert penting

## 🛠 Tech Stack

- **Backend**: Express.js (Node.js)
- **Template Engine**: EJS
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Authentication**: Session-based
- **Architecture**: Monolithic

## 📁 Struktur Project

```
candice-kids/
├── app.js                 # Main application file
├── package.json          # Dependencies
├── .env                  # Environment variables
├── database.sql          # Database schema & sample data
├── config/
│   └── database.js       # Database configuration
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── public.js        # Public routes (homepage, login)
│   ├── admin.js         # Admin panel routes
│   └── orangTua.js      # Parent portal routes
├── views/
│   ├── layouts/
│   │   ├── public.ejs   # Public layout
│   │   ├── admin.ejs    # Admin layout
│   │   └── orangTua.ejs # Parent layout
│   ├── public/          # Public pages
│   ├── admin/           # Admin pages
│   └── orangTua/        # Parent pages
├── public/
│   ├── css/
│   │   └── style.css    # Custom styles
│   ├── js/
│   │   └── main.js      # JavaScript utilities
│   └── images/          # Static images
├── controllers/         # Business logic (to be implemented)
└── models/             # Database models (to be implemented)
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 atau lebih baru)
- MySQL/MariaDB
- npm atau yarn

### Steps

1. **Clone/Download Project**
   ```bash
   cd "path/to/candice-kids"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Tailwind CSS**
   ```bash
   # Build CSS untuk pertama kali
   npm run build-css
   
   # Atau gunakan watch mode untuk development
   npm run watch-css
   ```

4. **Setup Environment Variables**
   Copy `.env` file dan sesuaikan konfigurasi:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=candice_kids
   SESSION_SECRET=your-secret-key
   ```

5. **Setup Database**
   - Buat database MySQL: `candice_kids`
   - Import schema dari `database.sql`
   ```sql
   mysql -u root -p < database.sql
   ```

6. **Run Application**
   ```bash
   # Development mode (with CSS watch)
   npm run dev-full
   
   # Development mode (server only)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access Application**
   - Homepage: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Parent Portal: http://localhost:3000/login

## 🎨 Tailwind CSS Setup

Project ini menggunakan **Tailwind CSS v4** dengan setup build yang optimal:

### CSS Architecture
```
src/
├── input.css           # Tailwind imports + custom styles
public/css/
├── output.css          # Generated Tailwind CSS (auto-generated)
└── style.css           # Additional custom styles
```

### Build Commands
```bash
# Build CSS sekali
npm run build-css

# Watch mode untuk development
npm run watch-css

# Development dengan CSS watch + server
npm run dev-full
```

### Custom Theme
Project sudah dikonfigurasi dengan theme custom untuk Candice Kids:
- **Primary Colors**: Coral (#FF6F61), Sky Blue (#6EC1E4), Yellow (#FFD166)
- **Typography**: Poppins font family
- **Custom Components**: Cards, buttons, forms dengan styling konsisten

## 🔐 Default Login Credentials

### Admin
- **Username**: admin
- **Password**: password

### Sample Parent Account
- **Email**: ayah.aisyah@email.com
- **Password**: password

> **Note**: Default password adalah "password" (hashed). Ganti segera untuk production!

## 🎨 Design System

### Color Palette
- **Primary**: #FF6F61 (Coral)
- **Secondary**: #6EC1E4 (Sky Blue)
- **Accent**: #FFD166 (Yellow)
- **Success**: #4CAF50 (Green)
- **Danger**: #F44336 (Red)
- **Background**: #FFF8F0 (Cream)

### Typography
- **Font Family**: 'Poppins', sans-serif
- **Responsive Design**: Mobile-first approach
- **Icons**: Font Awesome 6

## 📱 Responsive Design

Aplikasi ini fully responsive dan optimal untuk:
- 📱 Mobile devices
- 📱 Tablets
- 💻 Desktops
- 🖥 Large screens

## 🔒 Security Features

- Session-based authentication
- Role-based access control (Admin & Parent)
- Password hashing dengan bcrypt
- Input validation
- SQL injection protection
- XSS protection

## 🚧 Development Status

### ✅ Completed
- ✅ Project structure setup
- ✅ Authentication system
- ✅ Responsive layouts
- ✅ Basic routing
- ✅ Database schema
- ✅ UI components

### 🔄 In Progress
- 🔄 Database integration
- 🔄 CRUD operations
- 🔄 File upload system
- 🔄 Real-time notifications

### 📋 Todo
- ❌ User registration
- ❌ Password reset
- ❌ Email notifications
- ❌ Report generation
- ❌ Payment integration
- ❌ Mobile app (PWA)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

Untuk bantuan atau pertanyaan:
- 📧 Email: info@candicekids.com
- 📱 WhatsApp: +62 123 456 7890
- 🌐 Website: [www.candicekids.com](#)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Candice Kids** - Making childcare management easier, one step at a time! 👶✨
