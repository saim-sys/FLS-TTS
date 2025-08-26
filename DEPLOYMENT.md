# VoiceGen Deployment Guide

This guide will help you deploy your VoiceGen application to production securely.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/voice-gen-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Deploy!

### Option 2: Railway

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables
   - Deploy!

### Option 3: Render

1. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`
   - Add environment variables
   - Deploy!

## 🔧 Environment Variables Setup

### Required Variables

Set these in your deployment platform's environment variables section:

```env
# Database (Use a production PostgreSQL database)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (Generate a strong secret)
JWT_SECRET="your-super-secure-jwt-secret-here"

# External API Configuration
EXTERNAL_API_BASE_URL="https://genaipro.vn"
EXTERNAL_API_TOKEN="your-external-api-jwt-token"

# App Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Environment
NODE_ENV="production"
```

### Database Setup

#### Option A: Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

#### Option B: Railway Postgres
1. In Railway dashboard, add a Postgres service
2. Copy the connection string to `DATABASE_URL`

#### Option C: External Database (Supabase, PlanetScale, etc.)
1. Create a database on your preferred provider
2. Copy the connection string to `DATABASE_URL`

## 🗄️ Database Migration

After setting up your database, run the migration:

```bash
# If using Vercel CLI
vercel env pull .env.local
npx prisma db push

# Or connect to your database and run:
npx prisma db push --schema=./prisma/schema.prisma
```

## 🔒 Security Checklist

- [ ] **Strong JWT Secret**: Use a 64+ character random string
- [ ] **HTTPS Only**: Ensure your domain uses HTTPS
- [ ] **Environment Variables**: Never commit secrets to code
- [ ] **Database Security**: Use connection pooling and SSL
- [ ] **Rate Limiting**: Consider implementing rate limits
- [ ] **CORS Configuration**: Restrict to your domain only

## 🌐 Custom Domain Setup

### Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Railway/Render
1. Go to your service settings
2. Add custom domain
3. Update DNS records

## 📊 Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Built-in with Vercel
- **Sentry**: Error tracking
- **Google Analytics**: User analytics
- **Database Monitoring**: Use your database provider's tools

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` format
   - Ensure database is accessible
   - Verify SSL settings

2. **JWT Errors**
   - Regenerate JWT secret
   - Ensure `JWT_SECRET` is set correctly

3. **External API Errors**
   - Verify `EXTERNAL_API_TOKEN` is valid
   - Check API rate limits
   - Ensure callback URL is accessible

4. **Build Errors**
   - Check Node.js version (18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debug Commands

```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
npx prisma db pull

# Check build locally
npm run build

# Run linting
npm run lint
```

## 📈 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use Vercel's edge network or Cloudflare
4. **Image Optimization**: Use Next.js Image component
5. **Bundle Analysis**: Run `npm run build` to analyze bundle size

## 🔄 Updates & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Review security updates
- [ ] Backup database regularly

### Update Process
```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Deploy to staging first
git push origin staging

# Deploy to production
git push origin main
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the logs in your deployment platform
3. Test locally with `npm run dev`
4. Check the external API documentation

---

**Remember**: Your external API service is completely hidden from users. The proxy layer ensures full control over the user experience and branding.
