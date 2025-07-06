# Checklist Deploy ke Vercel

## ✅ Files yang Sudah Disiapkan
- [x] `vercel.json` - Konfigurasi routing dan build
- [x] `package.json` - Script `vercel-build` dan `postinstall`
- [x] `.vercelignore` - File yang diabaikan saat deploy
- [x] `.env.example` - Template environment variables
- [x] `VERCEL_DEPLOYMENT.md` - Panduan lengkap deployment
- [x] `app.js` - Export module untuk Vercel

## 🔧 Vercel Project Settings

### Build & Development Settings:
```
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: (kosongkan)
Install Command: npm install
Root Directory: ./
```

### Environment Variables (Wajib di-set):
```bash
DATABASE_URL="mysql://user:pass@host:port/database"
SESSION_SECRET="random_secret_key_minimum_32_characters"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"
MIDTRANS_IS_PRODUCTION="false"
NODE_ENV="production"
BASE_URL="https://your-app.vercel.app"
```

## 🗄️ Database Options
1. **PlanetScale** (Recommended untuk MySQL)
2. **Supabase** (PostgreSQL dengan UI bagus)
3. **Railway** (MySQL/PostgreSQL)
4. **AWS RDS**

## ⚠️ Important Notes
- File uploads tidak persisten di Vercel (gunakan Cloudinary/S3)
- Session akan reset tiap deploy (gunakan database sessions)
- Socket.IO mungkin tidak bekerja optimal (gunakan Vercel's real-time features)
- Database harus cloud-based dan accessible dari internet

## 🚀 Quick Deploy Steps
1. Push ke GitHub
2. Import di Vercel
3. Set environment variables
4. Deploy!
5. Run `npx prisma db push` untuk setup database
