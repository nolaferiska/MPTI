@echo off
echo 🗄️ Setting up database for production...

echo 📦 Generating Prisma client...
npx prisma generate

echo 🚀 Pushing database schema...
npx prisma db push --accept-data-loss

echo 🌱 Seeding database...
npm run db:seed

echo ✅ Database setup complete!
echo 🎉 Your app is ready for production!
