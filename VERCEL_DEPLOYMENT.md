# Vercel Deployment Guide

## Setup untuk Deploy ke Vercel

### 1. **Environment Variables di Vercel Dashboard**
Tambahkan environment variables berikut di Vercel Dashboard:

```bash
DATABASE_URL="your_production_database_url"
SESSION_SECRET="your_production_session_secret"
MIDTRANS_SERVER_KEY="your_midtrans_server_key"
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_IS_PRODUCTION="false"
BASE_URL="https://your-app-name.vercel.app"
MIDTRANS_FINISH_URL="https://your-app-name.vercel.app/payment/finish"
MIDTRANS_ERROR_URL="https://your-app-name.vercel.app/payment/error"
MIDTRANS_PENDING_URL="https://your-app-name.vercel.app/payment/pending"
MIDTRANS_NOTIFICATION_URL="https://your-app-name.vercel.app/payment/notification"
NODE_ENV="production"
```

### 2. **Database Setup**
- Gunakan database cloud seperti:
  - **PlanetScale** (MySQL) - Recommended
  - **Railway** (MySQL/PostgreSQL)
  - **Supabase** (PostgreSQL)
  - **AWS RDS**
  - **Google Cloud SQL**

### 3. **Vercel Project Settings**
```
Build Command: npm run vercel-build
Output Directory: (kosongkan atau .)
Install Command: npm install
Root Directory: ./
Node.js Version: 18.x
```

### 4. **File yang Sudah Disiapkan**
- ✅ `vercel.json` - Konfigurasi deployment
- ✅ `package.json` - Script build untuk Vercel
- ✅ `.env.example` - Template environment variables

### 5. **Steps Deploy**
1. Push code ke GitHub/GitLab
2. Connect repository ke Vercel
3. Set environment variables di Vercel Dashboard
4. Deploy!

### 6. **Database Migration**
Setelah deploy, jalankan migration dengan command:
```bash
npx prisma db push
```
Atau gunakan Vercel CLI:
```bash
vercel env pull .env.local
npx prisma db push
```

### 7. **File Upload Considerations**
- File upload (multer) tidak akan persist di Vercel
- Gunakan cloud storage seperti:
  - Cloudinary
  - AWS S3
  - Google Cloud Storage
  - Vercel Blob

### 8. **Session Storage**
- Session akan reset setiap deployment
- Untuk production, gunakan:
  - Redis (Upstash)
  - Database session store
  - JWT tokens

### 9. **Important Notes**
- Vercel functions timeout after 10s (hobby) / 30s (pro)
- Static files di `/public` akan di-serve otomatis
- Environment variables harus di-set di Vercel Dashboard
- Database harus accessible dari internet
