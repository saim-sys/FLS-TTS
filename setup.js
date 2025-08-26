#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🎤 VoiceGen Setup Script');
console.log('========================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
} else {
  console.log('📝 Creating .env.local file...');
  
  // Generate a secure JWT secret
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/voice_gen_db"

# JWT Secret (generated automatically)
JWT_SECRET="${jwtSecret}"

# External API Configuration (completely hidden from frontend)
EXTERNAL_API_BASE_URL="https://genaipro.vn"
EXTERNAL_API_TOKEN="your-external-api-jwt-token"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${jwtSecret}"

# Optional: For production
NODE_ENV="development"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created successfully');
  console.log('🔑 JWT Secret generated automatically');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit .env.local with your actual database and API credentials');
console.log('2. Set up a PostgreSQL database');
console.log('3. Run: npx prisma db push');
console.log('4. Run: npm run dev');
console.log('\n🔒 Security Note:');
console.log('- Never commit .env.local to version control');
console.log('- Use strong, unique secrets in production');
console.log('- The external API service is completely hidden from users');
