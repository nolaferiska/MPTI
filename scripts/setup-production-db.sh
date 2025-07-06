#!/bin/bash

# Production Database Setup Script
echo "🗄️ Setting up database for production..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (for services like PlanetScale)
echo "🚀 Pushing database schema..."
npx prisma db push --accept-data-loss

# Optional: Seed database with initial data
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🎉 Your app is ready for production!"
