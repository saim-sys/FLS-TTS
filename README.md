# VoiceGen - AI Text to Speech Platform

A professional AI-powered text-to-speech platform built for your paid community. This application provides a secure, branded interface for voice generation while completely hiding the underlying API service.

## 🚀 Features

- **Secure Proxy Layer**: Complete API service obfuscation - users never see the original service
- **Community Access Control**: Restricted access for paid community members only
- **Modern UI**: Beautiful, responsive interface similar to ElevenLabs
- **Real-time Processing**: Task-based voice generation with status tracking
- **User Management**: Authentication, user profiles, and usage tracking
- **Audio Management**: Play, download, and manage generated audio files
- **Advanced Controls**: Speed, style, similarity, stability, and speaker boost options

## 🛡️ Security Features

- **API Obfuscation**: External API completely hidden from frontend
- **JWT Authentication**: Secure token-based authentication
- **Request Validation**: Input sanitization and validation
- **Rate Limiting**: Per-user request limits
- **Environment Variables**: Secure configuration management

## 🏗️ Architecture

```
Frontend (Next.js) → Backend API Routes → Secure Proxy → External Voice API
```

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL for user and task management
- **Authentication**: JWT tokens with bcrypt password hashing
- **Proxy Layer**: Complete request/response transformation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- External voice API credentials (completely hidden from users)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd voice-gen-app
npm install
```

### 2. Environment Setup

Copy the environment example and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/voice_gen_db"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here"

# External API Configuration (completely hidden from frontend)
EXTERNAL_API_BASE_URL="https://genaipro.vn"
EXTERNAL_API_TOKEN="your-external-api-jwt-token"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Optional: For production
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🎯 Usage

### For Community Members

1. **Register/Login**: Create an account or sign in
2. **Create Voice**: Enter text, select voice, adjust settings
3. **Generate**: Submit and wait for processing
4. **Download**: Play or download completed audio files
5. **Manage**: View history and delete old generations

### For Administrators

- Monitor user activity through the database
- Manage user access and permissions
- Track usage and balance through the external API

## 🔧 Configuration

### Voice Options

Update the voice options in `app/dashboard/page.tsx`:

```typescript
const VOICE_OPTIONS = [
  { id: 'voice-1', name: 'Sarah (Female, Professional)' },
  { id: 'voice-2', name: 'Michael (Male, Friendly)' },
  // Add your actual voice IDs here
]
```

### API Endpoints

The application provides these secure endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user` - Get user info and balance
- `POST /api/tasks` - Create voice generation task
- `GET /api/tasks` - Get user's task history
- `GET /api/tasks/[id]` - Get specific task details
- `DELETE /api/tasks/[id]` - Delete task

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production

Make sure to set these in your production environment:

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
EXTERNAL_API_BASE_URL="https://genaipro.vn"
EXTERNAL_API_TOKEN="your-production-api-token"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NODE_ENV="production"
```

## 🔒 Security Considerations

1. **API Keys**: Never expose external API credentials in frontend code
2. **JWT Secrets**: Use strong, unique secrets for production
3. **Database**: Use connection pooling and SSL in production
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider implementing additional rate limiting
6. **CORS**: Configure CORS properly for your domain

## 📊 Database Schema

The application uses these main tables:

- **users**: User accounts and authentication
- **tasks**: Voice generation tasks and results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software for your community use.

## 🆘 Support

For support or questions:
- Check the documentation
- Review the code comments
- Contact your development team

---

**Note**: This application is designed to completely hide the external voice API service from your users. The proxy layer ensures that users never see or interact with the original API directly, providing you with full control over the user experience and branding.
